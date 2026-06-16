-- 결제 주문/승인 기록
create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  amount int not null check (amount > 0),
  status text not null default 'READY' check (status in ('READY','DONE','FAILED','CANCELED')),
  payment_key text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- 사용자별 현재 잔액
create table if not exists public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

-- 적립/차감 원장
create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta int not null,
  type text not null check (type in ('charge','spend','refund')),
  ref text not null,
  balance_after int not null,
  created_at timestamptz not null default now()
);

-- 멱등성: 같은 (user, type, ref) 변동은 1회만
create unique index if not exists credit_ledger_user_type_ref_uidx
  on public.credit_ledger (user_id, type, ref);

-- 원자적 잔액 변동 (충전/차감 공용, 멱등)
create or replace function public.apply_credit(
  p_user_id uuid, p_delta int, p_type text, p_ref text
) returns int
language plpgsql security definer set search_path = public as $$
declare
  v_existing int;
  v_balance int;
begin
  select balance_after into v_existing
  from credit_ledger
  where user_id = p_user_id and type = p_type and ref = p_ref
  limit 1;
  if found then
    return v_existing;
  end if;

  insert into credit_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance from credit_wallets
  where user_id = p_user_id for update;

  v_balance := v_balance + p_delta;
  if v_balance < 0 then
    raise exception 'INSUFFICIENT_CREDIT';
  end if;

  update credit_wallets set balance = v_balance, updated_at = now()
  where user_id = p_user_id;

  insert into credit_ledger (user_id, delta, type, ref, balance_after)
  values (p_user_id, p_delta, p_type, p_ref, v_balance);

  return v_balance;
end; $$;

-- 함수는 service_role(어드민 클라이언트)만 호출
revoke all on function public.apply_credit(uuid,int,text,text) from public;

-- RLS: 본인 행만 조회. 쓰기 정책 없음 → service_role(RLS 우회)만 변경 가능
alter table public.payment_orders enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_ledger enable row level security;

create policy "own orders read" on public.payment_orders
  for select using (auth.uid() = user_id);
create policy "own wallet read" on public.credit_wallets
  for select using (auth.uid() = user_id);
create policy "own ledger read" on public.credit_ledger
  for select using (auth.uid() = user_id);
