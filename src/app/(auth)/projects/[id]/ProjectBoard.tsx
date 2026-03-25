"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	PointerSensor,
	pointerWithin,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createTask, updateTaskStatus } from "./actions";

// ─── Types ───────────────────────────────────────────────────────────────────

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
type TaskStatus = (typeof STATUSES)[number];

function isValidStatus(value: unknown): value is TaskStatus {
	return STATUSES.includes(value as TaskStatus);
}

type Assignee = { id: string; name: string | null; email: string };

type Task = {
	id: string;
	title: string;
	description: string | null;
	status: TaskStatus;
	dueDate: Date | null;
	createdAt: Date;
	assigneeId: string | null;
	assignee: Assignee | null;
	projectId: string;
	orgId: string;
};

type Project = { id: string; name: string; orgId: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLUMN_CONFIG: Record<
	TaskStatus,
	{ label: string; headerClass: string; dotClass: string }
> = {
	TODO: {
		label: "To Do",
		headerClass: "bg-slate-100 text-slate-700",
		dotClass: "bg-slate-400",
	},
	IN_PROGRESS: {
		label: "In Progress",
		headerClass: "bg-amber-50 text-amber-700",
		dotClass: "bg-amber-400",
	},
	DONE: {
		label: "Done",
		headerClass: "bg-green-50 text-green-700",
		dotClass: "bg-green-500",
	},
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	}).format(new Date(date));
}

function isOverdue(date: Date) {
	return new Date(date) < new Date();
}

// ─── TaskCardContent ──────────────────────────────────────────────────────────

function TaskCardContent({
	task,
	faded,
}: {
	task: Task;
	faded?: boolean;
}) {
	return (
		<div
			className={`bg-white rounded-lg border border-border p-3 shadow-sm space-y-2 transition-opacity ${faded ? "opacity-40" : "opacity-100"}`}
		>
			<p className="text-sm font-medium leading-snug">{task.title}</p>

			{task.description && (
				<p className="text-xs text-muted-foreground line-clamp-2">
					{task.description}
				</p>
			)}

			<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
				{task.dueDate && (
					<Badge
						variant={isOverdue(task.dueDate) ? "destructive" : "secondary"}
						className="text-xs"
					>
						{formatDate(task.dueDate)}
					</Badge>
				)}
				{task.assignee && (
					<Badge variant="outline" className="text-xs">
						{task.assignee.name ?? task.assignee.email}
					</Badge>
				)}
			</div>
		</div>
	);
}

// ─── TaskCard (draggable) ─────────────────────────────────────────────────────

function TaskCard({ task }: { task: Task }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({ id: task.id });

	const style = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="cursor-grab active:cursor-grabbing touch-none"
		>
			<TaskCardContent task={task} faded={isDragging} />
		</div>
	);
}

// ─── Column ───────────────────────────────────────────────────────────────────

function Column({
	status,
	tasks,
	onAddTask,
}: {
	status: TaskStatus;
	tasks: Task[];
	onAddTask: (status: TaskStatus) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	const config = COLUMN_CONFIG[status];

	return (
		<div className="flex flex-col w-72 shrink-0">
			{/* Header */}
			<div
				className={`flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium text-sm ${config.headerClass}`}
			>
				<span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
				{config.label}
				<span className="ml-auto text-xs opacity-60">{tasks.length}</span>
			</div>

			{/* Drop zone */}
			<div
				ref={setNodeRef}
				className={`flex flex-col gap-2 flex-1 min-h-32 p-2 rounded-b-lg border border-t-0 border-border bg-muted/30 transition-colors ${isOver ? "bg-primary/5 border-primary/30" : ""}`}
			>
				{tasks.map((task) => (
					<TaskCard key={task.id} task={task} />
				))}

				<button
					onClick={() => onAddTask(status)}
					className="mt-1 flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
				>
					<span className="text-base leading-none">+</span> Add task
				</button>
			</div>
		</div>
	);
}

// ─── CreateTaskDialog ─────────────────────────────────────────────────────────

function CreateTaskDialog({
	open,
	status,
	projectId,
	orgId,
	onOpenChange,
	onCreated,
}: {
	open: boolean;
	status: TaskStatus;
	projectId: string;
	orgId: string;
	onOpenChange: (v: boolean) => void;
	onCreated: () => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [assignToMe, setAssignToMe] = useState(false);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		await createTask({ title, description, dueDate, status, projectId, orgId, assignToMe });
		setLoading(false);
		setTitle("");
		setDescription("");
		setDueDate("");
		setAssignToMe(false);
		onOpenChange(false);
		onCreated();
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						New task &mdash; {COLUMN_CONFIG[status].label}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="dueDate">Due date</Label>
						<Input
							id="dueDate"
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Checkbox
							id="assignToMe"
							checked={assignToMe}
							onCheckedChange={(v) => setAssignToMe(v === true)}
						/>
						<Label htmlFor="assignToMe" className="cursor-pointer">
							Assign to me
						</Label>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={loading}>
							{loading ? "Creating…" : "Create task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// ─── ProjectBoard ─────────────────────────────────────────────────────────────

export function ProjectBoard({
	project,
	initialTasks,
	userId,
}: {
	project: Project;
	initialTasks: Task[];
	userId: string;
}) {
	const router = useRouter();

	// Sync state when initialTasks changes (after router.refresh())
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const prevInitialRef = useRef(initialTasks);
	if (prevInitialRef.current !== initialTasks) {
		prevInitialRef.current = initialTasks;
		setTasks(initialTasks);
	}

	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const [myTasksOnly, setMyTasksOnly] = useState(false);
	const [dialogStatus, setDialogStatus] = useState<TaskStatus | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
	);

	const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

	const displayTasks = myTasksOnly
		? tasks.filter((t) => t.assigneeId === userId)
		: tasks;

	const tasksByStatus = {
		TODO: displayTasks.filter((t) => t.status === "TODO"),
		IN_PROGRESS: displayTasks.filter((t) => t.status === "IN_PROGRESS"),
		DONE: displayTasks.filter((t) => t.status === "DONE"),
	};

	function handleDragStart(event: DragStartEvent) {
		setActiveTaskId(event.active.id as string);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		setActiveTaskId(null);
		if (!over || !isValidStatus(over.id)) return;

		const taskId = active.id as string;
		const newStatus = over.id;
		const task = tasks.find((t) => t.id === taskId);
		if (!task || task.status === newStatus) return;

		// Optimistic update
		setTasks((prev) =>
			prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
		);
		updateTaskStatus(taskId, newStatus);
	}

	return (
		<div className="flex flex-col gap-6 p-6 min-h-full">
			{/* Toolbar */}
			<div className="flex items-center gap-4 flex-wrap">
				<button
					onClick={() => router.push("/dashboard")}
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					← Dashboard
				</button>
				<h1 className="text-xl font-semibold">{project.name}</h1>

				<div className="ml-auto flex items-center gap-2">
					<Checkbox
						id="myTasks"
						checked={myTasksOnly}
						onCheckedChange={(v) => setMyTasksOnly(v === true)}
					/>
					<Label htmlFor="myTasks" className="cursor-pointer text-sm">
						My tasks only
					</Label>
				</div>
			</div>

			{/* Board */}
			<DndContext
				sensors={sensors}
				collisionDetection={pointerWithin}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex gap-4 items-start overflow-x-auto pb-4">
					{STATUSES.map((status) => (
						<Column
							key={status}
							status={status}
							tasks={tasksByStatus[status]}
							onAddTask={setDialogStatus}
						/>
					))}
				</div>

				<DragOverlay>
					{activeTask ? <TaskCardContent task={activeTask} /> : null}
				</DragOverlay>
			</DndContext>

			{/* Create task dialog */}
			{dialogStatus && (
				<CreateTaskDialog
					open={true}
					status={dialogStatus}
					projectId={project.id}
					orgId={project.orgId}
					onOpenChange={(v) => { if (!v) setDialogStatus(null); }}
					onCreated={() => router.refresh()}
				/>
			)}
		</div>
	);
}
