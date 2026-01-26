import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

// Mock data – replace with real data later
const activities = [
  {
    id: 1,
    title: "New message from John Doe",
    time: "2 minutes ago",
    icon: MessageSquare,
    status: "unread",
  },
  {
    id: 2,
    title: "Replied to Sarah Smith",
    time: "15 minutes ago",
    icon: CheckCircle2,
    status: "read",
  },
  {
    id: 3,
    title: "Group chat updated",
    time: "1 hour ago",
    icon: MessageSquare,
    status: "read",
  },
  {
    id: 4,
    title: "New contact added",
    time: "2 hours ago",
    icon: CheckCircle2,
    status: "read",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Recent Activity
        </h2>
        <button className="text-xs sm:text-sm text-cyan-300 hover:underline">
          View all
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`
              group cursor-pointer
              flex items-start gap-3 sm:gap-4
              p-3 sm:p-4
              rounded-xl
              transition-all duration-300 ease-out
              hover:translate-x-1 hover:scale-[1.01]
              ${activity.status === "unread"
                ? "bg-cyan-400/10 border border-cyan-400/30 shadow-lg"
                : "hover:bg-white/10"
              }
            `}
          >
            {/* Icon */}
            <div
              className="
                flex h-9 w-9 sm:h-10 sm:w-10
                items-center justify-center
                rounded-lg
                bg-gradient-to-br from-cyan-400/20 to-blue-500/20
                text-cyan-300
                shrink-0
                transition-transform duration-300
                group-hover:scale-110
              "
            >
              <activity.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="
                  text-sm sm:text-base font-medium text-white truncate
                  transition-all duration-300
                  group-hover:text-cyan-300
                "
              >
                {activity.title}
              </p>

              <div className="flex items-center gap-1.5 mt-1 text-white/60 group-hover:text-white/80 transition-colors">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{activity.time}</span>
              </div>
            </div>

            {/* Unread / NEW indicator */}
            {activity.status === "unread" ? (
              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            ) : (
              activity.title === "New contact added" && (
                <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-300 animate-pulse">
                  NEW
                </span>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
