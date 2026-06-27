import {PlusIcon} from "lucide-react";
import {Button} from "../ui/button";

type TTabsHeaderProps = {
  Icon: React.ElementType;
  title: string;
  onClick: () => void;
  command: string;
};
export default function TabsHeader({Icon, onClick, command, title}: TTabsHeaderProps) {
  return (
    <div className="max-w-full flex justify-between items-center px-2.5 md:px-6 mt-1 bg-blue-300/10 rounded-none md:rounded-lg p-2.5 md:p-4 mx-1.5 md:mx-5">
      <div className="flex items-center gap-2">
        <div className="bg-blue-500/10 p-1.5 md:p-2 rounded-sm md:rounded-lg shadow-md">
          <Icon className="size-3 md:size-4 text-blue-500" />
        </div>
        <span className="text-xs md:text-sm font-medium">{title}</span>
      </div>
      <div>
        <Button
          size={"xs"}
          variant={"outline"}
          className="rounded-xs md:rounded-full shadow-md text-xs md:text-sm"
          onClick={onClick}
        >
          <PlusIcon /> {command}
        </Button>
      </div>
    </div>
  );
}
