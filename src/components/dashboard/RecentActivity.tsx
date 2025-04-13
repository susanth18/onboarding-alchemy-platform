
import React from "react";
import { 
  Clock, 
  FileText, 
  CheckSquare, 
  Calendar, 
  MessageSquare,
  User
} from "lucide-react";

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  iconColor: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time, iconColor }) => {
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-full ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <div className="flex items-center text-xs text-gray-400">
        <Clock size={12} className="mr-1" />
        {time}
      </div>
    </div>
  );
};

const RecentActivity: React.FC = () => {
  const activities = [
    {
      icon: <FileText size={16} className="text-blue-500" />,
      title: "Offer Letter Signed",
      description: "Sarah Johnson accepted the offer for UX Designer position",
      time: "10m ago",
      iconColor: "bg-blue-100"
    },
    {
      icon: <CheckSquare size={16} className="text-teal-500" />,
      title: "30-60-90 Plan Updated",
      description: "David Miller's plan was approved by department head",
      time: "1h ago",
      iconColor: "bg-teal-100"
    },
    {
      icon: <Calendar size={16} className="text-purple-500" />,
      title: "Orientation Scheduled",
      description: "New developer team orientation set for Monday, 9 AM",
      time: "2h ago",
      iconColor: "bg-purple-100"
    },
    {
      icon: <MessageSquare size={16} className="text-amber-500" />,
      title: "Feedback Submitted",
      description: "Emma Wilson submitted feedback for her first week",
      time: "5h ago",
      iconColor: "bg-amber-100"
    },
    {
      icon: <User size={16} className="text-red-500" />,
      title: "New Employee Added",
      description: "Michael Brown was added to Sales department",
      time: "1d ago",
      iconColor: "bg-red-100"
    }
  ];

  return (
    <div className="hr-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="hr-card-title">Recent Activity</h3>
        <button className="text-sm text-hr-blue hover:text-blue-700 font-medium">View All</button>
      </div>
      <div className="space-y-0">
        {activities.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
