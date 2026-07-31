import Card from './Card';

const StatCard = ({ title, value, description, icon }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</h4>
          <span className="text-3xl font-bold text-gray-900">{value}</span>
        </div>
        {icon && (
          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-200">
            {icon}
          </div>
        )}
      </div>
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </Card>
  );
};

export default StatCard;
