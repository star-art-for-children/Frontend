interface WorkFormProps {
  essential?: boolean;
  label: React.ReactNode;
  children: React.ReactNode;
}

export default function WorkFormBox({
  essential,
  label,
  children,
}: WorkFormProps) {
  return (
    <div className="flex flex-col gap-1 space-y-2">
      <label className="text-secondary text-sm font-medium">
        {label}
        {essential ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}
