import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronLeft, ChevronRight, Check, Lock, Crown,
  GraduationCap, Sparkles, PenLine, ArrowLeft, CheckCircle2,
  Circle, X, ShoppingCart, Feather, Star, Send, Sprout,
  Save, Leaf, MessageCircle
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

      <div className="grid gap-5 sm:grid-cols-2">
        {courses?.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} onSelect={onSelectCourse} />
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

function CourseCard({ course, index, onSelect }: { course: CourseListItem; index: number; onSelect: (id: string) => void }) {
  const { data: ratingData } = useQuery<{ average: number; count: number }>({
    queryKey: [`/api/courses/${course.id}/ratings`],
    select: (data: any) => ({ average: data.average, count: data.count }),
  });

  return (
    <motion.button
      onClick={() => onSelect(course.id)}
      className="text-left rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all group relative overflow-hidden"
      whileHover={{ y: -3, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      data-testid={`card-course-${course.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/20 border border-emerald-800/15 text-emerald-400/70 text-[10px] font-mono uppercase tracking-wider">
            {genreIcons[course.genre]}
            {genreLabels[course.genre] || course.genre}
          </span>
          {course.hasAccess ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/20 border border-emerald-600/20 text-emerald-400/70 text-[10px] font-mono uppercase tracking-wider">
              <Check size={10} />
              {course.accessReason === "cultivator" ? "Included" : "Owned"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/15 border border-amber-800/15 text-amber-400/70 text-[10px] font-mono uppercase tracking-wider">
              ${course.price}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl text-white/85 mb-3 group-hover:text-white/95 transition-colors leading-tight" data-testid={`text-course-title-${course.id}`}>
          {course.title}
        </h3>

        <p className="text-white/40 text-sm font-body leading-relaxed line-clamp-3 mb-5">
          {course.description}
        </p>

        {ratingData && ratingData.count > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={Math.round(ratingData.average)} size={13} />
            <span className="text-[10px] font-mono text-white/30">
              {ratingData.average.toFixed(1)} ({ratingData.count})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/30 pt-4 border-t border-white/[0.04]">
          <span className="flex items-center gap-1.5">
            <BookOpen size={11} className="text-emerald-400/40" />
            {course.lessonCount} lessons
          </span>
          {course.includedInCultivator && !course.hasAccess && (
            <span className="flex items-center gap-1 text-amber-500/50">
              <Crown size={10} />
              Free with Cultivator
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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star size={16} className="text-amber-400/60" />
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/40">Ratings & Reviews</h3>
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
        <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/30 px-1 mb-3">Lessons</h3>
        {course.lessons.map((lesson, i) => {
          const isAccessible = course.hasAccess;
          return (
            <motion.button
              key={lesson.id}
              onClick={() => isAccessible && onSelectLesson(lesson.id)}
              disabled={!isAccessible}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
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

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Begin writing here... your work saves automatically."
            className="w-full bg-transparent border-0 text-white/70 font-body text-sm leading-[1.8] resize-none focus:outline-none placeholder:text-white/15 min-h-[200px]"
            style={{ fontFamily: "'Special Elite', 'Courier New', monospace" }}
            rows={10}
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
      >
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-900/20 border border-emerald-800/20 flex items-center justify-center">
              <span className="text-emerald-400/60 text-xs font-mono">{lesson.currentIndex}</span>
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-white/90" data-testid="text-lesson-title">
                {lesson.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div
            className="prose-content font-body text-sm text-white/65 leading-relaxed space-y-4
              [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-white/90 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-white/[0.06]
              [&_h3]:font-display [&_h3]:text-base [&_h3]:text-white/80 [&_h3]:mt-6 [&_h3]:mb-2
              [&_h4]:font-display [&_h4]:text-sm [&_h4]:text-emerald-300/70 [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:uppercase [&_h4]:tracking-wide
              [&_strong]:text-white/80 [&_em]:text-white/55 [&_em]:italic
              [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul_li]:text-white/55 [&_ul_li]:leading-relaxed
              [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol_li]:text-white/55 [&_ol_li]:leading-relaxed
              [&_p]:text-white/60 [&_p]:leading-[1.75]
              [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500/30 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-white/55 [&_blockquote]:bg-amber-900/5 [&_blockquote]:rounded-r-lg [&_blockquote]:pr-4
              [&_hr]:border-white/[0.06] [&_hr]:my-6
              [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse
              [&_thead]:bg-white/[0.04] [&_th]:text-left [&_th]:text-white/50 [&_th]:font-mono [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[10px] [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-white/[0.08]
              [&_td]:px-3 [&_td]:py-2 [&_td]:text-white/50 [&_td]:border-b [&_td]:border-white/[0.04] [&_td]:align-top [&_td]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content) }}
          />
        </div>
      </motion.div>

      {lesson.writingPrompt && (
        <ExerciseWriter
          courseId={courseId}
          lessonId={lessonId}
          writingPrompt={lesson.writingPrompt}
        />
      )}

      <div className="flex items-center justify-between pt-2">
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
