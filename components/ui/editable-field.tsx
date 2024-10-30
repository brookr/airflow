import { AIFieldGenerator } from "./ai-field-generator";

interface EditableFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea';
  placeholder?: string;
  className?: string;
  context?: {
    content: string;
    title?: string;
    subtitle?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    category?: string;
    tags?: string;
  };
}

export function EditableField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  className,
  context,
}: EditableFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {context && (
          <AIFieldGenerator
            fieldName={label.toLowerCase()}
            currentValue={value}
            onGenerate={onChange}
            context={context}
          />
        )}
      </div>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${className}`}
          rows={4}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${className}`}
        />
      )}
    </div>
  );
}
