
interface StatsCardProps {
  title: string;
  value: number;
}

const StatsCard = ({ title, value }: StatsCardProps) => {
  return (
    <div className="rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h2>

      <p className="mt-3 text-3xl font-bold text-[var(--sea-ink)]">
        {value}
      </p>

      <div className="mt-4 h-1 w-12 rounded-full bg-teal-500" />
    </div>
  );
};

export default StatsCard;
