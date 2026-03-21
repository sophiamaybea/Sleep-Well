import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Room = "inbox" | "planning" | "correspondence" | "tasks" | "records";

export default function EditorialRoom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeRoom, setActiveRoom] = useState<Room>("inbox");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const isEditor = user?.role === "editor" || user?.role === "editor_in_chief" || user?.role === "admin";

  // Queries
  const { data: inbox = [] } = useQuery({
    queryKey: ["/api/editorial/inbox"],
    enabled: isEditor && activeRoom === "inbox",
  });

  const { data: threads = [] } = useQuery({
    queryKey: ["/api/editorial/threads"],
    enabled: isEditor && activeRoom === "correspondence",
  });

  const { data: threadDetail } = useQuery({
    queryKey: ["/api/editorial/threads", selectedThread],
    queryFn: () => apiRequest("GET", `/api/editorial/threads/${selectedThread}`).then(r => r.json()),
    enabled: !!selectedThread,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/editorial/tasks"],
    enabled: isEditor && activeRoom === "tasks",
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["/api/editor/issues"],
    enabled: isEditor && activeRoom === "planning",
  });

  const { data: contributors = [] } = useQuery({
    queryKey: ["/api/editorial/contributors"],
    enabled: isEditor && activeRoom === "records",
  });

  // Mutations
  const updateInboxState = useMutation({
    mutationFn: ({ writingId, state, decisionNote }: { writingId: string; state: string; decisionNote?: string }) =>
      apiRequest("PUT", `/api/editorial/inbox/${writingId}/state`, { state, decisionNote }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/editorial/inbox"] }),
  });

  const createThread = useMutation({
    mutationFn: (data: { subject: string; issueId?: string }) =>
      apiRequest("POST", "/api/editorial/threads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/threads"] });
      setNewThreadSubject("");
    },
  });

  const addMessage = useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      apiRequest("POST", `/api/editorial/threads/${threadId}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/threads", selectedThread] });
      setNewMessage("");
    },
  });

  const createTask = useMutation({
    mutationFn: (data: { title: string; priority?: string }) =>
      apiRequest("POST", "/api/editorial/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial/tasks"] });
      setNewTaskTitle("");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string }) =>
      apiRequest("PATCH", `/api/editorial/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/editorial/tasks"] }),
  });

  if (!isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="font-serif text-stone-500 text-lg">This room is for editors only.</p>
      </div>
    );
  }

  const rooms: { key: Room; label: string; description: string }[] = [
    { key: "inbox", label: "Inbox", description: "Pieces arriving from the Garden" },
    { key: "planning", label: "Planning Table", description: "Issues and editorial calendar" },
    { key: "correspondence", label: "Correspondence", description: "Internal editorial threads" },
    { key: "tasks", label: "Task Wall", description: "Things that need doing" },
    { key: "records", label: "Record Room", description: "Contributor archive" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-serif text-3xl text-stone-800 tracking-tight">The Editorial Room</h1>
          <p className="font-serif text-stone-500 mt-2 text-sm italic">Where the work of attention happens.</p>
        </div>
      </div>

      {/* Room Navigation */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {rooms.map((room) => (
              <button
                key={room.key}
                onClick={() => { setActiveRoom(room.key); setSelectedThread(null); }}
                className={`px-5 py-3 font-serif text-sm border-b-2 transition-all duration-500 whitespace-nowrap ${
                  activeRoom === room.key
                    ? "border-stone-800 text-stone-800"
                    : "border-transparent text-stone-400 hover:text-stone-600"
                }`}
              >
                {room.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Room Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="font-serif text-stone-400 text-sm italic mb-8">
          {rooms.find((r) => r.key === activeRoom)?.description}
        </p>

        {/* === INBOX === */}
        {activeRoom === "inbox" && (
          <div className="space-y-4">
            {(inbox as any[]).length === 0 && (
              <p className="font-serif text-stone-400 text-center py-12">The inbox is quiet. Nothing waiting.</p>
            )}
            {(inbox as any[]).map((item: any) => (
              <div key={item.id} className="bg-white border border-stone-200 rounded-lg p-6 transition-all duration-500 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
                      {item.inboxType === "gallery_opt_in" ? "Gallery Opt-In" : item.inboxType === "editorial_flag" ? "Editorial Flag" : "Submission Call"}
                    </span>
                    <h3 className="font-serif text-lg text-stone-800 mt-1">{item.title || item.writingTitle || "Untitled"}</h3>
                    <p className="text-sm text-stone-500 mt-1">by {item.authorName || item.writerName || "Unknown"}</p>
                    {item.genre && <span className="text-xs text-stone-400 mt-1 inline-block">{item.genre}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateInboxState.mutate({ writingId: item.writingId || item.id, state: "considering" })}
                      className="px-3 py-1 text-xs font-serif border border-stone-300 rounded hover:bg-stone-100 transition-colors"
                    >
                      Consider
                    </button>
                    <button
                      onClick={() => updateInboxState.mutate({ writingId: item.writingId || item.id, state: "accepted" })}
                      className="px-3 py-1 text-xs font-serif bg-stone-800 text-white rounded hover:bg-stone-700 transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === PLANNING TABLE === */}
        {activeRoom === "planning" && (
          <div className="space-y-4">
            {(issues as any[]).length === 0 && (
              <p className="font-serif text-stone-400 text-center py-12">No issues yet. Create one from the Editor Studio.</p>
            )}
            {(issues as any[]).map((issue: any) => (
              <div key={issue.id} className="bg-white border border-stone-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-stone-800">{issue.title}</h3>
                    {issue.subtitle && <p className="text-sm text-stone-500 mt-1">{issue.subtitle}</p>}
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded ${
                    issue.status === "published" ? "bg-green-50 text-green-700" :
                    issue.status === "draft" ? "bg-amber-50 text-amber-700" :
                    "bg-stone-100 text-stone-500"
                  }`}>
                    {issue.status}
                  </span>
                </div>
                {issue.themeNote && <p className="text-sm text-stone-400 mt-3 italic font-serif">{issue.themeNote}</p>}
                <div className="mt-3 text-xs text-stone-400">{issue.pieceCount || 0} pieces</div>
              </div>
            ))}
          </div>
        )}

        {/* === CORRESPONDENCE === */}
        {activeRoom === "correspondence" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Thread list */}
            <div className="space-y-3">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newThreadSubject}
                  onChange={(e) => setNewThreadSubject(e.target.value)}
                  placeholder="New thread subject..."
                  className="flex-1 px-3 py-2 border border-stone-200 rounded font-serif text-sm focus:outline-none focus:border-stone-400"
                />
                <button
                  onClick={() => newThreadSubject.trim() && createThread.mutate({ subject: newThreadSubject.trim() })}
                  className="px-3 py-2 bg-stone-800 text-white text-xs font-serif rounded hover:bg-stone-700"
                >
                  Start
                </button>
              </div>
              {(threads as any[]).map((thread: any) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                    selectedThread === thread.id
                      ? "border-stone-800 bg-white shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <h4 className="font-serif text-sm text-stone-800">{thread.subject}</h4>
                  <p className="text-xs text-stone-400 mt-1">by {thread.creatorName || "Editor"}</p>
                </button>
              ))}
            </div>

            {/* Thread detail */}
            <div className="md:col-span-2">
              {selectedThread && threadDetail ? (
                <div className="bg-white border border-stone-200 rounded-lg p-6">
                  <h3 className="font-serif text-xl text-stone-800 mb-6">{threadDetail.subject}</h3>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {(threadDetail.messages || []).map((msg: any) => (
                      <div key={msg.id} className="border-l-2 border-stone-200 pl-4">
                        <p className="text-xs text-stone-400 font-mono">{msg.senderName || "Editor"}</p>
                        <p className="font-serif text-sm text-stone-700 mt-1">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Add to the thread..."
                      className="flex-1 px-3 py-2 border border-stone-200 rounded font-serif text-sm focus:outline-none focus:border-stone-400"
                      onKeyDown={(e) => e.key === "Enter" && newMessage.trim() && addMessage.mutate({ threadId: selectedThread, content: newMessage.trim() })}
                    />
                    <button
                      onClick={() => newMessage.trim() && addMessage.mutate({ threadId: selectedThread, content: newMessage.trim() })}
                      className="px-4 py-2 bg-stone-800 text-white text-xs font-serif rounded hover:bg-stone-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-stone-400 font-serif text-sm italic">
                  Select a thread or start a new one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TASK WALL === */}
        {activeRoom === "tasks" && (
          <div>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs doing..."
                className="flex-1 px-4 py-2 border border-stone-200 rounded font-serif text-sm focus:outline-none focus:border-stone-400"
                onKeyDown={(e) => e.key === "Enter" && newTaskTitle.trim() && createTask.mutate({ title: newTaskTitle.trim() })}
              />
              <button
                onClick={() => newTaskTitle.trim() && createTask.mutate({ title: newTaskTitle.trim() })}
                className="px-4 py-2 bg-stone-800 text-white text-xs font-serif rounded hover:bg-stone-700"
              >
                Add Task
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["open", "in_progress", "done"].map((status) => (
                <div key={status}>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-stone-400 mb-3">
                    {status === "open" ? "To Do" : status === "in_progress" ? "In Progress" : "Done"}
                  </h3>
                  <div className="space-y-2">
                    {(tasks as any[]).filter((t: any) => t.status === status).map((task: any) => (
                      <div key={task.id} className="bg-white border border-stone-200 rounded-lg p-4">
                        <h4 className="font-serif text-sm text-stone-800">{task.title}</h4>
                        {task.assigneeName && <p className="text-xs text-stone-400 mt-1">{task.assigneeName}</p>}
                        <div className="flex gap-1 mt-3">
                          {status !== "open" && (
                            <button
                              onClick={() => updateTask.mutate({ id: task.id, status: "open" })}
                              className="text-xs text-stone-400 hover:text-stone-600"
                            >
                              To Do
                            </button>
                          )}
                          {status !== "in_progress" && (
                            <button
                              onClick={() => updateTask.mutate({ id: task.id, status: "in_progress" })}
                              className="text-xs text-stone-400 hover:text-stone-600"
                            >
                              In Progress
                            </button>
                          )}
                          {status !== "done" && (
                            <button
                              onClick={() => updateTask.mutate({ id: task.id, status: "done" })}
                              className="text-xs text-stone-400 hover:text-stone-600"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === RECORD ROOM === */}
        {activeRoom === "records" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(contributors as any[]).length === 0 && (
              <p className="font-serif text-stone-400 text-center py-12 col-span-full">No contributors yet.</p>
            )}
            {(contributors as any[]).map((c: any) => (
              <div key={c.id} className="bg-white border border-stone-200 rounded-lg p-5">
                <h4 className="font-serif text-stone-800">{c.firstName} {c.lastName || ""}</h4>
                {c.bio && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{c.bio}</p>}
                <div className="flex gap-4 mt-3 text-xs text-stone-400">
                  <span>{c.totalWritings} pieces</span>
                  <span>{c.publishedWritings} published</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
