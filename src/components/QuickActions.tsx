import Link from "next/link";
import { MessageSquare, UserPlus, Settings, Plus } from "lucide-react";

const actions = [
  {
    name: "New Message",
    href: "/chat/new",
    icon: MessageSquare,
    description: "Start a new conversation",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    name: "Add Contact",
    href: "/users/add",
    icon: UserPlus,
    description: "Add a new contact",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    name: "Create Group",
    href: "/chat/group",
    icon: Plus,
    description: "Create a group chat",
    gradient: "from-purple-400 to-fuchsia-500",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Manage your preferences",
    gradient: "from-gray-400 to-gray-600",
  },
];

export default function QuickActions() {
  return (
    <div
      className="
        bg-white/10 backdrop-blur-lg
        border border-white/20
        rounded-2xl
        p-4 sm:p-6
        shadow-xl
      "
    >
      <h2 className="text-base sm:text-lg font-semibold text-white mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="
              group
              flex flex-col items-center text-center
              p-3 sm:p-4
              rounded-xl
              bg-white/5
              border border-white/10
              transition-all duration-300
              hover:bg-white/10 hover:scale-[1.05]
              hover:shadow-2xl
            "
          >
            {/* Icon */}
            <div
              className={`
                flex h-11 w-11 sm:h-12 sm:w-12
                items-center justify-center
                rounded-xl
                bg-gradient-to-br ${action.gradient}
                text-white
                mb-2 sm:mb-3
                shadow-lg
                group-hover:scale-110
                transition-transform
              `}
            >
              <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            {/* Text */}
            <h3 className="text-sm font-semibold text-white mb-0.5">
              {action.name}
            </h3>
            <p className="text-xs text-white/60 leading-tight">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
