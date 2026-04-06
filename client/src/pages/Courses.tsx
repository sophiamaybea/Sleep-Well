import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronLeft, ChevronRight, Check, Lock, Crown,
  GraduationCap, Sparkles, PenLine, ArrowLeft, CheckCircle2,
  Circle, X, ShoppingCart, Feather, Star, Send, Sprout,
  Save, Leaf, MessageCircle, ChevronDown, Copy, Eye, EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import DOMPurify from "dompurify";
import { toast } from "@/hooks/use-toast";

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

type CourseRatingData = {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  review: string | null;
  userName: string | null;
  userImage: string | null;
  createdAt: string;
};

type ExerciseResponse = {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  content: string;
  savedToGarden: boolean;
  gardenWritingId: string | null;
  createdAt: string;
  updatedAt: string;
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

const genreCardBg: Record<string, string> = {
  poetry: "bg-gradient-to-br from-violet-950/15 via-indigo-950/10 to-emerald-950/8",
  essay: "bg-gradient-to-br from-amber-950/15 via-emerald-950/10 to-teal-950/8",
  fiction: "bg-gradient-to-br from-emerald-950/15 via-teal-950/12 to-cyan-950/8",
  craft: "bg-gradient-to-br from-rose-950/12 via-amber-950/10 to-emerald-950/8",
  nonfiction: "bg-gradient-to-br from-slate-950/12 via-emerald-950/10 to-teal-950/8",
};

const genreCardBorder: Record<string, string> = {
  poetry: "border-violet-800/20 hover:border-violet-600/30",
  essay: "border-amber-800/20 hover:border-amber-600/30",
  fiction: "border-emerald-800/20 hover:border-emerald-600/30",
  craft: "border-rose-800/20 hover:border-rose-600/30",
  nonfiction: "border-slate-700/20 hover:border-slate-500/25",
};

const genreGlow: Record<string, string> = {
  poetry: "rgba(139, 92, 246, 0.06)",
  essay: "rgba(245, 158, 11, 0.06)",
  fiction: "rgba(16, 185, 129, 0.06)",
  craft: "rgba(244, 63, 94, 0.06)",
  nonfiction: "rgba(148, 163, 184, 0.06)",
};

function StarRating({ rating, onRate, size = 18, interactive = false }: {
  rating: number;
  onRate?: (r: number) => void;
  size?: number;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-all ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          data-testid={`star-${star}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              (hover || rating) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-white/15"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function CourseCatalog({ onSelectCourse }: { onSelectCourse: (id: string) => void }) {
  const { data: courses, isLoading } = useQuery<CourseListItem[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="text-center pt-12 pb-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25 mb-4">The Page Gallery</p>
          <h2 className="font-display text-4xl sm:text-5xl text-white/90 italic mb-4">Craft Studies</h2>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mx-auto mb-4" />
          <p className="text-white/40 font-body text-sm max-w-md mx-auto leading-relaxed italic">
            Study the architecture of writing at your own pace.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 animate-pulse">
              <div className="h-5 w-2/3 bg-white/10 rounded mb-4" />
              <div className="h-3 w-full bg-white/5 rounded mb-2" />
              <div className="h-3 w-4/5 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <motion.div
        className="text-center pt-12 pb-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25 mb-4">The Page Gallery</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white/90 italic mb-4">Craft Studies</h1>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mx-auto mb-4" />
        <p className="text-white/40 font-body text-sm max-w-md mx-auto leading-relaxed italic">
          Study the architecture of writing at your own pace.
        </p>
      </motion.div>

      <motion.div
        className="text-center py-24"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Feather size={28} className="mx-auto mb-6 text-white/15" />
        <p className="font-display text-2xl italic text-white/35 mb-3">Coming Soon</p>
        <p className="font-body text-sm text-white/20 max-w-sm mx-auto leading-relaxed">
          We're preparing our first courses — guided studies in poetry, essays, and revision, written by Sophia Maye. Check back soon.
        </p>
      </motion.div>
    </div>
  );
}

function CourseCard({ course, index, onSelect }: { course: CourseListItem; index: number; onSelect: (id: string) => void }) {
  const { data: ratingData } = useQuery<{ average: number; count: number }>({
    queryKey: [`/api/courses/${course.id}/ratings`],
    select: (data: any) => ({ average: data.average, count: data.count }),
  });

  return (
    <motion.button
      onClick={() => onSelect(course.id)}
      className={`text-left rounded-2xl border p-7 sm:p-8 transition-all group relative overflow-hidden ${genreCardBg[course.genre] || "bg-emerald-950/10"} ${genreCardBorder[course.genre] || "border-white/[0.08] hover:border-white/[0.14]"}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`card-course-${course.id}`}
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        background: `radial-gradient(ellipse at 80% 0%, ${genreGlow[course.genre] || "transparent"} 0%, transparent 60%)`,
      }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-5">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            {genreLabels[course.genre] || course.genre}
          </span>
          {course.hasAccess ? (
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400/50">
              {course.accessReason === "cultivator" ? "included" : "yours"}
            </span>
          ) : (
            <span className="font-display text-sm italic text-amber-400/60">
              ${course.price}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-white/85 mb-3 group-hover:text-white/95 transition-colors leading-normal italic" data-testid={`text-course-title-${course.id}`}>
          {course.title}
        </h3>

        <p className="text-white/35 text-sm font-body leading-relaxed line-clamp-3 mb-6">
          {course.description}
        </p>

        {ratingData && ratingData.count > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <StarRating rating={Math.round(ratingData.average)} size={12} />
            <span className="text-[9px] font-mono text-white/25">
              {ratingData.average.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-white/25 pt-5 border-t border-white/[0.05]">
          <span>{course.lessonCount} lessons</span>
          {course.includedInCultivator && !course.hasAccess && (
            <span className="flex items-center gap-1 text-amber-400/35">
              <Crown size={9} />
              cultivator
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function CourseRatingSection({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: ratingsData } = useQuery<{ ratings: CourseRatingData[]; average: number; count: number }>({
    queryKey: [`/api/courses/${courseId}/ratings`],
  });

  const { data: existingRating } = useQuery<CourseRatingData | null>({
    queryKey: [`/api/courses/${courseId}/my-rating`],
    enabled: !!user,
  });

  useEffect(() => {
    if (existingRating) {
      setMyRating(existingRating.rating);
      setMyReview(existingRating.review || "");
    }
  }, [existingRating]);

  const rateMutation = useMutation({
    mutationFn: (data: { rating: number; review?: string }) =>
      apiRequest("POST", `/api/courses/${courseId}/ratings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/my-rating`] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowReviewForm(false);
      toast({ title: "Rating saved", description: "Thank you for your feedback." });
    },
  });

  const handleRate = (r: number) => {
    setMyRating(r);
    setShowReviewForm(true);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7">
      <div className="mb-5">
        <h3 className="font-display text-lg italic text-white/60 mb-1">What readers say</h3>
        <div className="w-10 h-[1px] bg-white/10" />
      </div>

      {ratingsData && ratingsData.count > 0 && (
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.04]">
          <div className="text-center">
            <div className="font-display text-3xl text-white/80">{ratingsData.average.toFixed(1)}</div>
            <StarRating rating={Math.round(ratingsData.average)} size={14} />
            <div className="text-[9px] font-mono text-white/30 mt-1">{ratingsData.count} {ratingsData.count === 1 ? "rating" : "ratings"}</div>
          </div>
        </div>
      )}

      {user && (
        <div className="mb-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/30 mb-2">
            {existingRating ? "Update your rating" : "Rate this course"}
          </p>
          <StarRating rating={myRating} onRate={handleRate} size={22} interactive />

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <textarea
                    value={myReview}
                    onChange={e => setMyReview(e.target.value)}
                    placeholder="Share your thoughts about this course... (optional)"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white/70 font-body text-sm resize-none focus:outline-none focus:border-emerald-600/30 placeholder:text-white/20 transition-colors"
                    rows={3}
                    data-testid="input-review"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rateMutation.mutate({ rating: myRating, review: myReview || undefined })}
                      disabled={rateMutation.isPending || myRating === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/15 border border-emerald-600/20 text-emerald-300/70 hover:bg-emerald-600/25 transition-all font-mono text-xs uppercase tracking-wider disabled:opacity-40"
                      data-testid="button-submit-rating"
                    >
                      <Send size={12} />
                      {rateMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      className="px-3 py-2 text-white/30 hover:text-white/50 font-mono text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {ratingsData && ratingsData.ratings.length > 0 && (
        <div className="space-y-4">
          {ratingsData.ratings.slice(0, 5).map((r) => (
            <div key={r.id} className="border-t border-white/[0.04] pt-4">
              <div className="flex items-center gap-3 mb-2">
                {r.userImage ? (
                  <img src={r.userImage} alt="" className="w-6 h-6 rounded-full opacity-60" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center">
                    <PenLine size={10} className="text-white/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-white/50 text-xs font-body">{r.userName || "Anonymous"}</span>
                </div>
                <StarRating rating={r.rating} size={11} />
              </div>
              {r.review && (
                <p className="text-white/40 text-sm font-body leading-relaxed italic pl-9">
                  "{r.review}"
                </p>
              )}
            </div>
          ))}
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
      <div className="space-y-8">
        <button onClick={onBack} className="text-white/30 hover:text-white/55 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]">
          <span className="inline-flex items-center gap-1.5"><ArrowLeft size={11} /> return to catalog</span>
        </button>
        <div className="animate-pulse space-y-5 rounded-2xl border border-white/[0.06] p-8">
          <div className="h-4 w-1/4 bg-white/5 rounded" />
          <div className="h-8 w-2/3 bg-white/8 rounded" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-4/5 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  const progressPercent = course.lessonCount > 0 ? Math.round((course.completedCount / course.lessonCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="text-white/30 hover:text-white/55 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]"
        data-testid="button-back-courses"
      >
        <span className="inline-flex items-center gap-1.5">
          <ArrowLeft size={11} />
          return to catalog
        </span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`rounded-2xl border overflow-hidden relative ${genreCardBg[course.genre] || "bg-emerald-950/10"} ${genreCardBorder[course.genre]?.split(" ")[0] || "border-white/[0.08]"}`}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at 30% 0%, ${genreGlow[course.genre]?.replace("0.06", "0.1") || "transparent"} 0%, transparent 50%)`,
        }} />

        <div className="relative p-7 sm:p-10">
          <div className="flex items-start justify-between mb-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
              {genreLabels[course.genre] || course.genre}
            </span>
            {course.hasAccess && course.accessReason === "cultivator" && (
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-amber-400/40 flex items-center gap-1">
                <Crown size={9} />
                cultivator
              </span>
            )}
          </div>

          <h2 className="font-display text-3xl sm:text-4xl text-white/90 italic mb-4 leading-normal" data-testid="text-course-detail-title">
            {course.title}
          </h2>

          <p className="text-white/40 font-body text-sm leading-relaxed mb-6 max-w-xl">
            {course.description}
          </p>

          <div className="flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.15em] text-white/25 mb-2">
            <span>{course.lessonCount} lessons</span>
            <span className="w-[1px] h-3 bg-white/10" />
            <span className="italic font-body text-[11px] normal-case tracking-normal text-white/35">by {course.instructor}</span>
          </div>
          <p className="text-white/20 font-body text-[11px] italic leading-relaxed mb-8">
            Sophia Maye — poet, editor, and founder of The Page Gallery Journal
          </p>

          {course.hasAccess && course.lessonCount > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-white/30 mb-2">
                <span>Progress</span>
                <span>{course.completedCount} of {course.lessonCount}</span>
              </div>
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          )}

          {!course.hasAccess && (
            <div className="rounded-xl border border-amber-800/15 bg-amber-900/[0.06] p-5">
              <p className="text-white/45 text-sm font-body italic mb-3">
                {course.includedInCultivator
                  ? "Included with the Cultivator plan, or available individually."
                  : "Purchase for permanent access."}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-display text-xl italic text-amber-400/60">${course.price}</span>
                <button
                  onClick={() => purchaseMutation.mutate()}
                  disabled={purchaseMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] hover:bg-white/[0.1] hover:border-white/[0.18] text-white/70 hover:text-white/90 transition-all font-mono text-[10px] uppercase tracking-[0.15em]"
                  data-testid="button-purchase-course"
                >
                  {purchaseMutation.isPending ? "opening..." : "begin studying"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-2">
        <h3 className="font-display text-sm italic text-white/40 px-1 mb-4">Lessons</h3>
        {course.lessons.map((lesson, i) => {
          const isAccessible = course.hasAccess;
          return (
            <motion.button
              key={lesson.id}
              onClick={() => isAccessible && onSelectLesson(lesson.id)}
              disabled={!isAccessible}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-lg border transition-all group/lesson ${
                isAccessible
                  ? "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer"
                  : "border-white/[0.04] opacity-50 cursor-not-allowed"
              }`}
              data-testid={`button-lesson-${lesson.id}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                lesson.completed
                  ? "bg-emerald-600/20 border border-emerald-600/25"
                  : isAccessible
                    ? "bg-white/[0.04] border border-white/[0.08] group-hover/lesson:border-emerald-600/20 group-hover/lesson:bg-emerald-900/10"
                    : "bg-white/[0.04] border border-white/[0.08]"
              }`}>
                {lesson.completed ? (
                  <Check size={14} className="text-emerald-400/80" />
                ) : isAccessible ? (
                  <span className="text-white/30 text-xs font-mono group-hover/lesson:text-emerald-400/50 transition-colors">{i + 1}</span>
                ) : (
                  <Lock size={12} className="text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-body transition-colors ${lesson.completed ? "text-white/60" : "text-white/70"} ${isAccessible ? "group-hover/lesson:text-white/85" : ""}`}>
                  {lesson.title}
                </p>
                {lesson.hasWritingPrompt && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/40 mt-0.5 inline-flex items-center gap-1">
                    <PenLine size={9} /> includes writing exercise
                  </span>
                )}
              </div>
              {isAccessible && <ChevronRight size={16} className="text-white/20 flex-shrink-0 group-hover/lesson:text-white/40 group-hover/lesson:translate-x-0.5 transition-all" />}
            </motion.button>
          );
        })}
      </div>

      {course.hasAccess && (
        <CourseRatingSection courseId={courseId} />
      )}
    </div>
  );
}

function ExerciseWriter({ courseId, lessonId, writingPrompt }: {
  courseId: string;
  lessonId: string;
  writingPrompt: string;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveToGarden, setShowSaveToGarden] = useState(false);
  const [gardenTitle, setGardenTitle] = useState("");
  const [savedToGarden, setSavedToGarden] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: existingResponse } = useQuery<ExerciseResponse | null>({
    queryKey: [`/api/courses/${courseId}/lessons/${lessonId}/exercise`],
  });

  useEffect(() => {
    if (existingResponse) {
      setContent(existingResponse.content);
      setSavedToGarden(existingResponse.savedToGarden);
      if (existingResponse.updatedAt) {
        setLastSaved(new Date(existingResponse.updatedAt));
      }
    }
  }, [existingResponse]);

  const autoSave = useCallback((text: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!text.trim()) return;
      setIsSaving(true);
      try {
        await apiRequest("POST", `/api/courses/${courseId}/lessons/${lessonId}/exercise`, { content: text });
        setLastSaved(new Date());
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/lessons/${lessonId}/exercise`] });
      } catch (e) {}
      setIsSaving(false);
    }, 1500);
  }, [courseId, lessonId, queryClient]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    autoSave(text);
  };

  const saveToGardenMutation = useMutation({
    mutationFn: (title: string) =>
      apiRequest("POST", `/api/courses/${courseId}/lessons/${lessonId}/save-to-garden`, { title }),
    onSuccess: () => {
      setSavedToGarden(true);
      setShowSaveToGarden(false);
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/lessons/${lessonId}/exercise`] });
      toast({ title: "Planted in your garden", description: "Your exercise response has been saved as a new piece in your garden." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to save to garden", variant: "destructive" });
    },
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <div className="rounded-xl border border-emerald-800/20 bg-gradient-to-b from-emerald-900/10 to-transparent overflow-hidden">
        <div className="px-5 py-3 border-b border-emerald-800/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine size={14} className="text-emerald-400/60" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/50">Writing Exercise</span>
          </div>
          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="text-[9px] font-mono text-emerald-400/40 animate-pulse">Saving...</span>
            )}
            {!isSaving && lastSaved && (
              <span className="text-[9px] font-mono text-white/20">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <span className="text-[9px] font-mono text-white/20">{wordCount} words</span>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 p-4 rounded-lg bg-emerald-900/10 border border-emerald-800/10">
            <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/40 mb-2">Prompt</p>
            <p className="text-white/55 font-body text-sm leading-relaxed italic">
              {writingPrompt}
            </p>
          </div>

          <p className="text-white/15 font-mono text-[9px] tracking-wide mb-2 italic">
            line breaks and spacing are preserved exactly as you type them.
          </p>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Begin writing here... your work saves automatically."
            className="w-full bg-transparent border-0 text-white/70 text-[15px] resize-none focus:outline-none placeholder:text-white/15 min-h-[200px]"
            style={{ fontFamily: "var(--font-display)", whiteSpace: "pre-wrap", lineHeight: 1.6, tabSize: 4 }}
            rows={12}
            data-testid="textarea-exercise"
          />
        </div>

        <div className="px-5 py-3 border-t border-emerald-800/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedToGarden ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/50">
                <Sprout size={12} />
                Planted in your garden
              </span>
            ) : content.trim().length > 0 ? (
              <button
                onClick={() => setShowSaveToGarden(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-800/20 bg-emerald-900/10 text-emerald-300/60 hover:text-emerald-300/80 hover:bg-emerald-900/20 transition-all font-mono text-[10px] uppercase tracking-wider"
                data-testid="button-save-to-garden"
              >
                <Sprout size={12} />
                Save to Garden
              </button>
            ) : null}
          </div>
          <button
            onClick={async () => {
              if (!content.trim()) return;
              setIsSaving(true);
              try {
                await apiRequest("POST", `/api/courses/${courseId}/lessons/${lessonId}/exercise`, { content });
                setLastSaved(new Date());
                toast({ title: "Saved", description: "Your exercise has been saved." });
              } catch (e) {}
              setIsSaving(false);
            }}
            disabled={!content.trim() || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all font-mono text-[10px] uppercase tracking-wider disabled:opacity-30"
            data-testid="button-save-exercise"
          >
            <Save size={12} />
            Save Now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSaveToGarden && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 rounded-xl border border-emerald-800/20 bg-emerald-900/10 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={14} className="text-emerald-400/50" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/40">Plant in Your Garden</span>
            </div>
            <p className="text-white/40 text-xs font-body mb-3">
              This will create a new piece in your garden from your exercise response. You can continue working on it there.
            </p>
            <input
              type="text"
              value={gardenTitle}
              onChange={e => setGardenTitle(e.target.value)}
              placeholder="Give your piece a title..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white/70 font-body text-sm focus:outline-none focus:border-emerald-600/30 placeholder:text-white/20 mb-3 transition-colors"
              data-testid="input-garden-title"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => gardenTitle.trim() && saveToGardenMutation.mutate(gardenTitle.trim())}
                disabled={!gardenTitle.trim() || saveToGardenMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/15 border border-emerald-600/20 text-emerald-300/70 hover:bg-emerald-600/25 transition-all font-mono text-xs uppercase tracking-wider disabled:opacity-40"
                data-testid="button-confirm-save-garden"
              >
                <Sprout size={13} />
                {saveToGardenMutation.isPending ? "Planting..." : "Plant It"}
              </button>
              <button
                onClick={() => setShowSaveToGarden(false)}
                className="px-3 py-2 text-white/30 hover:text-white/50 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InteractiveLessonContent({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);

  const sanitizedHtml = useMemo(() => DOMPurify.sanitize(html), [html]);

  const sections = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedHtml, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    const result: { type: string; heading?: string; content: string; index: number }[] = [];
    let currentSection: { type: string; heading?: string; content: string; index: number } | null = null;
    let sectionIndex = 0;

    nodes.forEach((node) => {
      const el = node as HTMLElement;
      const tagName = el.tagName?.toLowerCase();

      if (tagName === "h2" || tagName === "h3") {
        if (currentSection) result.push(currentSection);
        currentSection = {
          type: tagName,
          heading: el.textContent || "",
          content: "",
          index: sectionIndex++,
        };
      } else {
        const outerHtml = el.outerHTML || el.textContent || "";
        if (currentSection) {
          currentSection.content += outerHtml;
        } else {
          result.push({ type: "content", content: outerHtml, index: sectionIndex++ });
        }
      }
    });
    if (currentSection) result.push(currentSection);
    return result;
  }, [sanitizedHtml]);

  const toggleSection = (index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard" });
  };

  const renderInteractiveHtml = (htmlStr: string, sectionIdx: number) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    return nodes.map((node, nodeIdx) => {
      const el = node as HTMLElement;
      const tagName = el.tagName?.toLowerCase();

      if (tagName === "ul" || tagName === "ol") {
        const items = Array.from(el.querySelectorAll("li"));
        return (
          <div key={`${sectionIdx}-${nodeIdx}`} className="my-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-1">
            {items.map((li, liIdx) => {
              const itemKey = `${sectionIdx}-${nodeIdx}-${liIdx}`;
              const isChecked = checkedItems.has(itemKey);
              return (
                <div
                  key={itemKey}
                  onClick={() => toggleCheck(itemKey)}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group/item
                    ${isChecked ? "bg-emerald-900/10 border border-emerald-800/15" : "hover:bg-white/[0.03] border border-transparent"}
                    ${liIdx < items.length - 1 ? "border-b border-b-white/[0.03]" : ""}`}
                  data-testid={`check-item-${itemKey}`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all
                    ${isChecked
                      ? "bg-emerald-600/30 border-emerald-500/40"
                      : "border-white/15 group-hover/item:border-emerald-500/30"}`}
                  >
                    {isChecked && <Check size={10} className="text-emerald-300/80" />}
                    {tagName === "ol" && !isChecked && (
                      <span className="text-[9px] font-mono text-white/30">{liIdx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm leading-relaxed transition-all flex-1 ${isChecked ? "text-white/35 line-through decoration-white/15" : "text-white/55"}`}
                    dangerouslySetInnerHTML={{ __html: li.innerHTML }}
                  />
                </div>
              );
            })}
          </div>
        );
      }

      if (tagName === "blockquote") {
        const text = el.textContent || "";
        return (
          <div key={`${sectionIdx}-${nodeIdx}`} className="my-5 relative group/quote">
            <div className="border-l-2 border-amber-500/25 pl-5 py-3 italic text-white/50 bg-amber-900/5 rounded-r-xl pr-12">
              <div dangerouslySetInnerHTML={{ __html: el.innerHTML }} />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); copyText(text); }}
              className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover/quote:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/50"
              data-testid={`button-copy-quote-${sectionIdx}-${nodeIdx}`}
            >
              <Copy size={12} />
            </button>
          </div>
        );
      }

      if (tagName === "table") {
        return (
          <div key={`${sectionIdx}-${nodeIdx}`} className="my-5 rounded-xl border border-white/[0.06] overflow-hidden">
            <div
              className="interactive-table text-xs [&_thead]:bg-white/[0.04] [&_th]:text-left [&_th]:text-white/50 [&_th]:font-mono [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[10px] [&_th]:px-4 [&_th]:py-3 [&_th]:border-b [&_th]:border-white/[0.08] [&_td]:px-4 [&_td]:py-3 [&_td]:text-white/50 [&_td]:border-b [&_td]:border-white/[0.04] [&_td]:align-top [&_td]:leading-relaxed [&_tr]:transition-colors [&_tbody_tr:hover]:bg-white/[0.03] [&_table]:w-full [&_table]:border-collapse"
              dangerouslySetInnerHTML={{ __html: el.outerHTML }}
            />
          </div>
        );
      }

      if (tagName === "p") {
        return (
          <p
            key={`${sectionIdx}-${nodeIdx}`}
            className="text-white/55 leading-[1.85] mb-4 lesson-paragraph [&_strong]:text-emerald-300/80 [&_strong]:bg-emerald-900/15 [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:rounded [&_strong]:border [&_strong]:border-emerald-800/15 [&_strong]:text-[13px] [&_strong]:font-medium [&_strong]:cursor-pointer [&_strong]:transition-all [&_strong:hover]:bg-emerald-900/30 [&_strong:hover]:border-emerald-700/25 [&_strong:hover]:text-emerald-200/90 [&_strong:hover]:shadow-[0_0_12px_rgba(16,185,129,0.15)] [&_em]:text-white/50 [&_em]:italic"
            dangerouslySetInnerHTML={{ __html: el.innerHTML }}
          />
        );
      }

      if (tagName === "hr") {
        return <hr key={`${sectionIdx}-${nodeIdx}`} className="border-white/[0.06] my-8" />;
      }

      return (
        <div
          key={`${sectionIdx}-${nodeIdx}`}
          className="[&_strong]:text-emerald-300/80 [&_strong]:bg-emerald-900/15 [&_strong]:px-1.5 [&_strong]:py-0.5 [&_strong]:rounded [&_strong]:border [&_strong]:border-emerald-800/15 [&_strong]:text-[13px] [&_strong]:font-medium [&_strong]:cursor-pointer [&_strong]:transition-all [&_strong:hover]:bg-emerald-900/30 [&_strong:hover]:border-emerald-700/25 [&_strong:hover]:text-emerald-200/90 [&_strong:hover]:shadow-[0_0_12px_rgba(16,185,129,0.15)] [&_em]:text-white/50"
          dangerouslySetInnerHTML={{ __html: el.outerHTML }}
        />
      );
    });
  };

  return (
    <div ref={contentRef} className="lesson-content font-body text-sm text-white/65 leading-relaxed space-y-0">
      {sections.map((section) => {
        if (section.type === "h2") {
          const isCollapsed = collapsedSections.has(section.index);
          return (
            <div key={section.index} className="mt-8 first:mt-0">
              <button
                onClick={() => toggleSection(section.index)}
                className="w-full flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08] group/section cursor-pointer text-left"
                data-testid={`button-toggle-section-${section.index}`}
              >
                <h2 className="font-display text-lg text-white/90 tracking-wide group-hover/section:text-white transition-colors">
                  {section.heading}
                </h2>
                <motion.div
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/30 group-hover/section:text-white/50 transition-colors flex-shrink-0"
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      {renderInteractiveHtml(section.content, section.index)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        if (section.type === "h3") {
          const isCollapsed = collapsedSections.has(section.index);
          return (
            <div key={section.index} className="mt-6">
              <button
                onClick={() => toggleSection(section.index)}
                className="w-full flex items-center justify-between gap-3 pl-3 border-l-2 border-emerald-500/30 group/section cursor-pointer text-left"
                data-testid={`button-toggle-section-${section.index}`}
              >
                <h3 className="font-display text-[15px] text-emerald-300/70 tracking-wide group-hover/section:text-emerald-200/80 transition-colors">
                  {section.heading}
                </h3>
                <motion.div
                  animate={{ rotate: isCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-emerald-400/30 group-hover/section:text-emerald-400/50 transition-colors flex-shrink-0"
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3">
                      {renderInteractiveHtml(section.content, section.index)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div key={section.index}>
            {renderInteractiveHtml(section.content, section.index)}
          </div>
        );
      })}
    </div>
  );
}

const suggestedReadings: Record<string, { author: string; title: string; note?: string }[]> = {
  "Welcome & Orientation": [
    { author: "Mary Oliver", title: "A Poetry Handbook", note: "Essential introduction to the craft" },
    { author: "Edward Hirsch", title: "How to Read a Poem and Fall in Love with Poetry" },
    { author: "Mark Strand & Eavan Boland", title: "The Making of a Poem: A Norton Anthology of Poetic Forms" },
  ],
  "The Line as Unit of Thought": [
    { author: "William Carlos Williams", title: "Spring and All" },
    { author: "Denise Levertov", title: "Some Notes on Organic Form", note: "Essay on line as breath" },
    { author: "C.D. Wright", title: "Steal Away: Selected and New Poems" },
  ],
  "Enjambment as Argument": [
    { author: "Claudia Rankine", title: "Citizen: An American Lyric", note: "Radical use of line and space" },
    { author: "James Wright", title: "Above the River: Complete Poems" },
    { author: "Robert Hass", title: "Time and Materials" },
  ],
  "Stanza Breaks vs Section Breaks": [
    { author: "Louise Glück", title: "The Wild Iris", note: "Masterful stanza architecture" },
    { author: "Frank Bidart", title: "In the Western Night: Collected Poems" },
    { author: "Brigit Pegeen Kelly", title: "Song" },
  ],
  "Syntax and Lineation": [
    { author: "John Ashbery", title: "Self-Portrait in a Convex Mirror" },
    { author: "Jorie Graham", title: "The Dream of the Unified Field", note: "Syntax against lineation" },
    { author: "A.R. Ammons", title: "Garbage", note: "One long sentence as poem" },
  ],
  "Constraint Forms as Structural Practice": [
    { author: "Terrance Hayes", title: "Lighthead", note: "The golden shovel and invented forms" },
    { author: "Harryette Mullen", title: "Sleeping with the Dictionary", note: "Constraint as liberation" },
    { author: "Christian Bök", title: "Eunoia", note: "Lipogram — each chapter uses only one vowel" },
  ],
  "White Space as Composition": [
    { author: "Charles Olson", title: "The Maximus Poems", note: "Open field composition" },
    { author: "Susan Howe", title: "Singularities", note: "Page as visual field" },
    { author: "Larry Eigner", title: "The Collected Poems" },
  ],
  "Sound and Measure (Syllabics)": [
    { author: "Gerard Manley Hopkins", title: "Poems and Prose", note: "Sprung rhythm" },
    { author: "Seamus Heaney", title: "Opened Ground: Selected Poems", note: "Sonic patterning" },
    { author: "Gwendolyn Brooks", title: "Selected Poems", note: "Sound and measure in service of meaning" },
  ],
  "The Prose Poem and Hybridity": [
    { author: "Charles Baudelaire", title: "Paris Spleen", note: "Foundational prose poems" },
    { author: "Claudia Rankine", title: "Don't Let Me Be Lonely", note: "Hybrid form" },
    { author: "Anne Carson", title: "Short Talks", note: "Between essay and poem" },
  ],
  "Revision as Re-Seeing": [
    { author: "Donald Hall", title: "The Unsayable Said", note: "On the revision process" },
    { author: "Stephen Dobyns", title: "Best Words, Best Order", note: "Practical craft essays" },
    { author: "Richard Hugo", title: "The Triggering Town", note: "Finding the real subject" },
  ],
  "Close Reading Workshop": [
    { author: "Helen Vendler", title: "Poems, Poets, Poetry: An Introduction and Anthology" },
    { author: "Terry Eagleton", title: "How to Read a Poem" },
    { author: "Randall Jarrell", title: "No Other Book: Selected Essays", note: "Close reading as art" },
  ],
  "Capstone: Your Sequence": [
    { author: "Natasha Trethewey", title: "Native Guard", note: "Sequence as historical witness" },
    { author: "Jack Gilbert", title: "Refusing Heaven" },
    { author: "Rita Dove", title: "Thomas and Beulah", note: "Narrative sequence" },
  ],
  "Why Form Matters": [
    { author: "Mary Oliver", title: "Rules for the Dance", note: "A practical guide to poetic form" },
    { author: "Robert Pinsky", title: "The Sounds of Poetry" },
  ],
  "The Line Break as Instrument": [
    { author: "William Carlos Williams", title: "Paterson" },
    { author: "Denise Levertov", title: "The Poet in the World" },
  ],
  "Stanza and Breath": [
    { author: "W.S. Merwin", title: "The Rain in the Trees", note: "Unpunctuated stanzas" },
    { author: "Elizabeth Bishop", title: "Geography III" },
  ],
  "Sound and Rhythm": [
    { author: "Seamus Heaney", title: "Finders Keepers: Selected Prose" },
    { author: "Robert Frost", title: "Collected Poems", note: "The sound of sense" },
  ],
  "Putting It All Together": [
    { author: "Stanley Kunitz", title: "The Collected Poems" },
    { author: "Mark Doty", title: "Fire to Fire: New and Selected Poems" },
  ],
  "What Is a Lyric Essay?": [
    { author: "Maggie Nelson", title: "Bluets", note: "Lyric essay as numbered meditation" },
    { author: "Jenny Offill", title: "Dept. of Speculation" },
  ],
  "The Art of Braiding": [
    { author: "Eula Biss", title: "On Immunity", note: "Braided research and personal narrative" },
    { author: "Sarah Manguso", title: "Ongoingness" },
  ],
  "Fragment and White Space": [
    { author: "Anne Carson", title: "Nox", note: "Fragment as elegy" },
    { author: "Wayne Koestenbaum", title: "My 1980s & Other Essays" },
  ],
  "Image as Argument": [
    { author: "Joan Didion", title: "The White Album" },
    { author: "James Baldwin", title: "Notes of a Native Son", note: "Image and moral argument" },
  ],
  "Seeing Your Draft Freshly": [
    { author: "Anne Lamott", title: "Bird by Bird", note: "On shitty first drafts" },
    { author: "Verlyn Klinkenborg", title: "Several Short Sentences About Writing" },
  ],
  "Finding the Real Subject": [
    { author: "Richard Hugo", title: "The Triggering Town", note: "The poem you thought vs. the poem you wrote" },
    { author: "Kim Addonizio", title: "Ordinary Genius" },
  ],
  "Structural Revision": [
    { author: "Ursula K. Le Guin", title: "Steering the Craft" },
    { author: "Francine Prose", title: "Reading Like a Writer" },
  ],
  "Sentence-Level Craft": [
    { author: "Stanley Fish", title: "How to Write a Sentence and How to Read One" },
    { author: "Virginia Tufte", title: "Artful Sentences: Syntax as Style" },
  ],
};

function SuggestedReading({ lessonTitle }: { lessonTitle: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const readings = suggestedReadings[lessonTitle];
  if (!readings || readings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left group"
        data-testid="button-toggle-reading-list"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={13} className="text-white/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">Suggested Reading</span>
        </div>
        <ChevronDown
          size={13}
          className={`text-white/20 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 space-y-3 border-t border-white/[0.04] pt-3">
              {readings.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white/10 mt-0.5 text-[10px]">{i + 1}.</span>
                  <div>
                    <span className="font-body text-[13px] text-white/40 italic">{r.title}</span>
                    <span className="font-body text-[13px] text-white/25"> — {r.author}</span>
                    {r.note && (
                      <span className="font-body text-[11px] text-white/15 block mt-0.5">{r.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LessonView({ courseId, lessonId, onBack, onNavigate }: {
  courseId: string;
  lessonId: string;
  onBack: () => void;
  onNavigate: (lessonId: string) => void;
}) {
  const queryClient = useQueryClient();

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
      <div className="space-y-8">
        <button onClick={onBack} className="text-white/30 hover:text-white/55 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]">
          <span className="inline-flex items-center gap-1.5"><ArrowLeft size={11} /> return to course</span>
        </button>
        <div className="animate-pulse space-y-5 rounded-2xl border border-white/[0.06] p-8">
          <div className="h-3 w-1/6 bg-white/5 rounded" />
          <div className="h-7 w-1/2 bg-white/8 rounded" />
          <div className="w-12 h-[1px] bg-white/5" />
          <div className="h-4 w-full bg-white/5 rounded" />
          <div className="h-4 w-4/5 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white/30 hover:text-white/55 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]"
          data-testid="button-back-course"
        >
          <span className="inline-flex items-center gap-1.5">
            <ArrowLeft size={11} />
            return to course
          </span>
        </button>
        <span className="text-[9px] font-mono text-white/20 tracking-[0.15em]">
          {lesson.currentIndex} of {lesson.totalLessons}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden"
      >
        <div className="px-7 sm:px-10 pt-8 sm:pt-10 pb-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3">Lesson {lesson.currentIndex}</p>
          <h2 className="font-display text-2xl sm:text-3xl text-white/90 italic leading-normal" data-testid="text-lesson-title">
            {lesson.title}
          </h2>
          <div className="w-12 h-[1px] bg-white/10 mt-5" />
        </div>

        <div className="px-7 sm:px-10 pb-8 sm:pb-10">
          <InteractiveLessonContent html={lesson.content} />
        </div>
      </motion.div>

      {lesson.writingPrompt && (
        <ExerciseWriter
          courseId={courseId}
          lessonId={lessonId}
          writingPrompt={lesson.writingPrompt}
        />
      )}

      <SuggestedReading lessonTitle={lesson.title} />

      <div className="flex items-center justify-between pt-4">
        <div>
          {lesson.prevLessonId ? (
            <button
              onClick={() => onNavigate(lesson.prevLessonId!)}
              className="text-white/25 hover:text-white/50 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]"
              data-testid="button-prev-lesson"
            >
              <span className="inline-flex items-center gap-1"><ChevronLeft size={11} /> previous</span>
            </button>
          ) : <div />}
        </div>

        <button
          onClick={() => lesson.completed ? uncompleteMutation.mutate() : completeMutation.mutate()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all font-mono text-[10px] uppercase tracking-[0.15em] ${
            lesson.completed
              ? "border-emerald-600/20 bg-emerald-600/10 text-emerald-300/70"
              : "border-white/[0.08] text-white/40 hover:border-emerald-600/15 hover:text-emerald-300/50 hover:bg-emerald-900/[0.06]"
          }`}
          data-testid="button-mark-complete"
        >
          {lesson.completed ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {lesson.completed ? "completed" : "mark complete"}
        </button>

        <div>
          {lesson.nextLessonId ? (
            <button
              onClick={() => onNavigate(lesson.nextLessonId!)}
              className="text-white/25 hover:text-white/50 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]"
              data-testid="button-next-lesson"
            >
              <span className="inline-flex items-center gap-1">continue <ChevronRight size={11} /></span>
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

      <header className="sticky top-0 z-50 garden-header-bg backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/garden")}
            className="text-white/30 hover:text-white/55 transition-colors font-mono text-[10px] lowercase tracking-[0.15em]"
            data-testid="button-back-garden"
          >
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft size={11} />
              garden
            </span>
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="text-white/20 hover:text-white/40 font-mono text-[9px] lowercase tracking-[0.15em] transition-colors"
            data-testid="button-toggle-theme"
          >
            {isLightMode ? "night" : "daylight"}
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
