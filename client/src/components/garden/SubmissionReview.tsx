import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Send, Award } from 'lucide-react';

interface Submission {
  id: number;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  stage: 'draft' | 'review' | 'published';
}

interface SubmissionReviewProps {
  submission: Submission;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onFeedback?: (id: number, feedback: string) => void;
}

const SubmissionReview: React.FC<SubmissionReviewProps> = ({
  submission,
  onApprove,
  onReject,
  onFeedback
}) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmitFeedback = () => {
    if (feedback.trim() && onFeedback) {
      onFeedback(submission.id, feedback);
      setFeedback('');
      setShowFeedback(false);
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(submission.id);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(submission.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {submission.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Award size={16} />
                {submission.author}
              </span>
              <span>·</span>
              <span>{submission.timestamp.toLocaleDateString()}</span>
              <span>·</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                submission.stage === 'published'
                  ? 'bg-green-100 text-green-800'
                  : submission.stage === 'review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {submission.stage}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose max-w-none mb-6">
        <div
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: submission.content }}
        />
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate this submission
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-colors"
            >
              <Star
                size={24}
                className={`${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleApprove}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <ThumbsUp size={18} />
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <ThumbsUp size={18} className="rotate-180" />
          Reject
        </button>
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <MessageCircle size={18} />
          Feedback
        </button>
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide constructive feedback for the author..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setShowFeedback(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionReview;
