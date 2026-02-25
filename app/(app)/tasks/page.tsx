import { getTasks } from "@/actions/tasks";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage() {
  const tasks = await getTasks();

  return <TaskList initialTasks={tasks} />;
}
