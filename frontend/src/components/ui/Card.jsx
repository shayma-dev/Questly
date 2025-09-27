// src/components/ui/Card.jsx
export default function Card({ className = '', children }) {
  return (
    <div
      className={
        'rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] shadow-card ' +
        className
      }
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={'p-4 ' + className}>{children}</div>;
}