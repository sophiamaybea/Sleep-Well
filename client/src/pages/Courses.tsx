import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronLeft, ChevronRight, Check, Lock, Crown,
  GraduationCap, Sparkles, PenLine, ArrowLeft, CheckCircle2,
  Circle, Menu, X, ShoppingCart, Feather
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from "dompurify";

type CourseListItem = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  genre: string;
  price: number;
  includedInCultivator: boolean;
  isPublished: boolean;
  lessonCount: number;
  hasAccess: boolean;
  accessReason: string | null;
};

type CourseDetail = CourseListItem & {
  lessons: {
    id: string;
    title: string;
    sortOrder: number;
    hasWritingPrompt: boolean;
    completed: boolean;
  }[];
  completedCount: number;
};

type LessonDetail = {
  id: string;
  courseId: string;
  title: string;
  content: string;
  writingPrompt: string | null;
  sortOrder: number;
  completed: boolean;
  prevLessonId: string | null;
  nextLessonId: string | null;
  totalLessons: number;
  currentIndex: number;
};

const genreLabels: Record<string, string> = {
  poetry: "Poetry",
  essay: "Essay",
  fiction: "Fiction",
  craft: "Craft",
  nonfiction: "Nonfiction",
};

const genreIcons: Record<string, React.ReactNode> = {
  poetry: <Feather size={14} />,
  essay: <PenLine size={14} />,
  fiction: <BookOpen size={14} />,
  craft: <Sparkles size={14} />,
};

function CourseCatalog({ onSelectCourse }: { onSelectCourse: (id: string) => void }) {
  const { data: courses, isLoading } = useQuery<CourseListItem[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="font-display text-2xl text-white/90 mb-2">Courses</h2>
          <p className="text-white/50 font-body text-sm max-w-lg mx-auto">
            Craft lessons from The Page Gallery — study the architecture of writing at your own pace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 animate-pulse">
              <div className="h-5 w-2/3 bg-white/10 rounded mb-3" />
              <div className="h-3 w-full bg-white/5 rounded mb-2" />
              <div className="h-3 w-4/5 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <GraduationCap size={20} className="text-emerald-400/70" />
          <h2 className="font-display text-2xl text-white/90">Courses</h2>
        </div>
        <p className="text-white/50 font-body text-sm max-w-lg mx-auto">
          Craft lessons from The Page Gallery — study the architecture of writing at your own pace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <motion.button
            key={course.id}
            onClick={() => onSelectCourse(course.id)}
            className="text-left rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
            whileHover={{ y: -2 }}
            data-testid={`card-course-${course.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-800/15 text-emerald-400/70 text-[10px] font-mono uppercase tracking-wider">
                {genreIcons[course.genre]}
                {genreLabels[course.genre] || course.genre}
              </span>
              {course.hasAccess ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-800/15 text-emerald-400/70 text-[10px] font-mono uppercase tracking-wider">
                  <Check size={10} />
                  {course.accessReason === "cultivator" ? "Included" : "Owned"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/15 border border-amber-800/15 text-amber-400/70 text-[10px] font-mono uppercase tracking-wider">
                  ${course.price}
                </span>
              )}
            </div>

            <h3 className="font-display text-lg text-white/85 mb-2 group-hover:text-white/95 transition-colors" data-testid={`text-course-title-${course.id}`}>
              {course.title}
            </h3>

            <p className="text-white/40 text-sm font-body leading-relaxed line-clamp-3 mb-4">
              {course.description}
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/30">
              <span>{course.lessonCount} lessons</span>
              {course.includedInCultivator && !course.hasAccess && (
                <span className="flex items-center gap-1 text-amber-500/50">
                  <Crown size={10} />
                  Free with Cultivator
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {(!courses || courses.length === 0) && !isLoading && (
        <div className="text-center py-16 text-white/30">
          <GraduationCap size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-body text-sm">No courses available yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}

function CourseDetailView({ courseId, onBack, onSelectLesson }: {
  courseId: string;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data: course, isLoading } = useQuery<CourseDetail>({
    queryKey: [`/api/courses/${courseId}`],
  });

  const purchaseMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/courses/${courseId}/purchase`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
  });

  if (isLoading || !course) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono">
          <ArrowLeft size={14} /> Back to courses
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-4/5 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  const progressPercent = course.lessonCount > 0 ? Math.round((course.completedCount / course.lessonCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono transition-colors"
        data-testid="button-back-courses"
      >
        <ArrowLeft size={14} /> Back to courses
      </button>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-800/15 text-emerald-400/70 text-[10px] font-mono uppercase tracking-wider">
            {genreIcons[course.genre]}
            {genreLabels[course.genre] || course.genre}
          </span>
          {course.hasAccess && course.accessReason === "cultivator" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-900/15 border border-amber-800/15 text-amber-400/60 text-[10px] font-mono uppercase tracking-wider">
              <Crown size={10} />
              Cultivator
            </span>
          )}
        </div>

        <h2 className="font-display text-2xl sm:text-3xl text-white/90 mb-3" data-testid="text-course-detail-title">
          {course.title}
        </h2>

        <p className="text-white/50 font-body text-sm leading-relaxed mb-6">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-white/30 mb-6">
          <span>{course.lessonCount} lessons</span>
          <span>by {course.instructor}</span>
        </div>

        {course.hasAccess && course.lessonCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
              <span>Progress</span>
              <span>{course.completedCount}/{course.lessonCount} complete</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {!course.hasAccess && (
          <div className="rounded-lg border border-amber-800/20 bg-amber-900/10 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-body mb-1">
                  {course.includedInCultivator
                    ? "This course is included with the Cultivator plan, or purchase it individually."
                    : "Purchase this course for permanent access."}
                </p>
                <p className="text-amber-400/60 font-display text-xl">${course.price}</p>
              </div>
              <button
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-600/25 text-emerald-300/80 hover:bg-emerald-600/30 transition-all font-mono text-xs uppercase tracking-wider"
                data-testid="button-purchase-course"
              >
                <ShoppingCart size={14} />
                {purchaseMutation.isPending ? "Processing..." : "Get Access"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/30 px-1">Lessons</h3>
        {course.lessons.map((lesson, i) => {
          const isAccessible = course.hasAccess;
          return (
            <button
              key={lesson.id}
              onClick={() => isAccessible && onSelectLesson(lesson.id)}
              disabled={!isAccessible}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-lg border transition-all ${
                isAccessible
                  ? "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer"
                  : "border-white/[0.04] opacity-50 cursor-not-allowed"
              }`}
              data-testid={`button-lesson-${lesson.id}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                lesson.completed
                  ? "bg-emerald-600/20 border border-emerald-600/25"
                  : "bg-white/[0.04] border border-white/[0.08]"
              }`}>
                {lesson.completed ? (
                  <Check size={14} className="text-emerald-400/80" />
                ) : isAccessible ? (
                  <span className="text-white/30 text-xs font-mono">{i + 1}</span>
                ) : (
                  <Lock size={12} className="text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-body ${lesson.completed ? "text-white/60" : "text-white/70"}`}>
                  {lesson.title}
                </p>
                {lesson.hasWritingPrompt && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/40 mt-0.5 inline-flex items-center gap-1">
                    <PenLine size={9} /> includes writing prompt
                  </span>
                )}
              </div>
              {isAccessible && <ChevronRight size={16} className="text-white/20 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LessonView({ courseId, lessonId, onBack, onNavigate }: {
  courseId: string;
  lessonId: string;
  onBack: () => void;
  onNavigate: (lessonId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [showPrompt, setShowPrompt] = useState(false);

  const { data: lesson, isLoading } = useQuery<LessonDetail>({
    queryKey: [`/api/courses/${courseId}/lessons/${lessonId}`],
  });

  const completeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/courses/${courseId}/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/lessons/${lessonId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/courses/${courseId}/lessons/${lessonId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/lessons/${lessonId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}`] });
    },
  });

  if (isLoading || !lesson) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono">
          <ArrowLeft size={14} /> Back to course
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 bg-white/10 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-4/5 bg-white/5 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/40 hover:text-white/60 text-sm font-mono transition-colors"
          data-testid="button-back-course"
        >
          <ArrowLeft size={14} /> Back to course
        </button>
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
          Lesson {lesson.currentIndex} of {lesson.totalLessons}
        </span>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl text-white/90 mb-6" data-testid="text-lesson-title">
          {lesson.title}
        </h2>

        <div
          className="prose-content font-body text-sm text-white/65 leading-relaxed space-y-4
            [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-white/85 [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:font-display [&_h3]:text-base [&_h3]:text-white/80 [&_h3]:mt-5 [&_h3]:mb-2
            [&_strong]:text-white/75 [&_em]:text-white/60
            [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul_li]:text-white/55
            [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol_li]:text-white/55
            [&_p]:text-white/60
            [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-600/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/50"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content) }}
        />

        {lesson.writingPrompt && (
          <div className="mt-8">
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-800/20 bg-emerald-900/10 text-emerald-300/70 hover:bg-emerald-900/20 transition-all font-mono text-xs uppercase tracking-wider w-full justify-center"
              data-testid="button-toggle-prompt"
            >
              <PenLine size={14} />
              {showPrompt ? "Hide Writing Prompt" : "Show Writing Prompt"}
            </button>
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-5 rounded-lg border border-emerald-800/15 bg-emerald-900/10">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/50 mb-2">Writing Prompt</p>
                    <p className="text-white/60 font-body text-sm leading-relaxed italic">
                      {lesson.writingPrompt}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {lesson.prevLessonId ? (
            <button
              onClick={() => onNavigate(lesson.prevLessonId!)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all font-mono text-xs"
              data-testid="button-prev-lesson"
            >
              <ChevronLeft size={14} /> Previous
            </button>
          ) : <div />}
        </div>

        <button
          onClick={() => lesson.completed ? uncompleteMutation.mutate() : completeMutation.mutate()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-mono text-xs uppercase tracking-wider ${
            lesson.completed
              ? "border-emerald-600/25 bg-emerald-600/15 text-emerald-300/80"
              : "border-white/[0.08] text-white/50 hover:border-emerald-600/20 hover:text-emerald-300/60 hover:bg-emerald-900/10"
          }`}
          data-testid="button-mark-complete"
        >
          {lesson.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {lesson.completed ? "Completed" : "Mark Complete"}
        </button>

        <div>
          {lesson.nextLessonId ? (
            <button
              onClick={() => onNavigate(lesson.nextLessonId!)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all font-mono text-xs"
              data-testid="button-next-lesson"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}

type CoursesView = "catalog" | "course" | "lesson";

export default function Courses() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<CoursesView>("catalog");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    setView("course");
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setView("lesson");
  };

  const handleBackToCatalog = () => {
    setView("catalog");
    setSelectedCourseId(null);
    setSelectedLessonId(null);
  };

  const handleBackToCourse = () => {
    setView("course");
    setSelectedLessonId(null);
  };

  const handleNavigateLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  return (
    <div className={`min-h-screen garden-bg ${isLightMode ? "garden-light" : ""}`}>
      <div className="night-garden-atmosphere" />
      <div className="moonlight-glow" />

      <header className="sticky top-0 z-50 garden-header-bg backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/garden")}
              className="text-white/40 hover:text-white/60 transition-colors"
              data-testid="button-back-garden"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-400/60" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">Courses</span>
            </div>
          </div>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="px-2 py-1 rounded-full border border-white/[0.06] text-white/30 hover:text-white/50 font-mono text-[9px] uppercase tracking-wider transition-all"
            data-testid="button-toggle-theme"
          >
            {isLightMode ? "Dark" : "Light"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "catalog" && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CourseCatalog onSelectCourse={handleSelectCourse} />
            </motion.div>
          )}
          {view === "course" && selectedCourseId && (
            <motion.div
              key={`course-${selectedCourseId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CourseDetailView
                courseId={selectedCourseId}
                onBack={handleBackToCatalog}
                onSelectLesson={handleSelectLesson}
              />
            </motion.div>
          )}
          {view === "lesson" && selectedCourseId && selectedLessonId && (
            <motion.div
              key={`lesson-${selectedLessonId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <LessonView
                courseId={selectedCourseId}
                lessonId={selectedLessonId}
                onBack={handleBackToCourse}
                onNavigate={handleNavigateLesson}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
