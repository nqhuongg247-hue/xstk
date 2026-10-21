import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Search, 
  Filter, 
  Flag, 
  CheckCircle, 
  Plus, 
  User, 
  Sparkles,
  BookOpen,
  Share2,
  Trash2
} from 'lucide-react';
import { ForumPost, ForumComment, UserProfile } from '../types';
import { CHAPTERS_DATA } from '../data/chaptersData';
import { MathView } from './MathView';

interface ForumProps {
  currentUser: UserProfile;
}

export const Forum: React.FC<ForumProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showMyPostsOnly, setShowMyPostsOnly] = useState<boolean>(false);

  // New Post Form
  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newChapterId, setNewChapterId] = useState<number>(1);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // New Comment Form
  const [commentContent, setCommentContent] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Report Modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('Nội dung không liên quan XSTK');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string>('');

  // Fetch posts from backend API
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const url = new URL('/api/forum/posts', window.location.origin);
      if (filterChapter !== 'all') url.searchParams.append('chapterId', filterChapter);
      if (searchQuery) url.searchParams.append('search', searchQuery);
      url.searchParams.append('sort', sortBy);

      const res = await fetch(url.toString());
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterChapter, sortBy]);

  // Fetch comments for selected post
  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSelectPost = (post: ForumPost) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  // Submit new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      const chapter = CHAPTERS_DATA.find((c) => c.id === newChapterId);
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          chapterId: newChapterId,
          chapterTitle: chapter ? chapter.title : undefined,
          title: newTitle,
          content: newContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreatingPost(false);
        setNewTitle('');
        setNewContent('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Submit comment
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentContent.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/forum/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: commentContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentContent('');
        fetchComments(selectedPost.id);
        // also refresh posts to update comment count
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // React to post
  const handleReact = async (postId: string, reactionType = 'like') => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          reactionType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                reactions: data.reactions,
                userReactions: data.userReactions,
              };
            }
            return p;
          })
        );
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost((prev) => (prev ? { ...prev, reactions: data.reactions, userReactions: data.userReactions } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit report
  const handleReport = async () => {
    if (!reportingPostId) return;
    try {
      const res = await fetch(`/api/forum/posts/${reportingPostId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      setReportSuccessMsg(data.message || 'Đã gửi báo cáo.');
      setTimeout(() => {
        setReportingPostId(null);
        setReportSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const displayedPosts = showMyPostsOnly
    ? posts.filter((p) => p.authorId === currentUser.id)
    : posts;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1B3D2F] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#D6A64F] text-[#1B3D2F]">
              DỮ LIỆU ĐỒNG BỘ MÁY CHỦ THẬT
            </span>
            <span className="text-xs text-emerald-300">Không dùng dữ liệu giả lập</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-[#D6A64F]" />
            DIỄN ĐÀN HỌC TẬP XSTK
          </h2>
          <p className="mt-1.5 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Nơi thảo luận các bài toán hóc búa, chia sẻ kinh nghiệm ôn thi đại học và nhận lời giải đáp từ giảng viên & bạn bè.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPost(true)}
          className="py-3 px-5 rounded-xl font-bold text-xs md:text-sm bg-[#D6A64F] text-[#1B3D2F] hover:bg-amber-400 transition-all flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> Đăng câu hỏi mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              placeholder="Tìm kiếm bài viết, công thức hoặc câu hỏi..."
              className="w-full py-2 pl-8 pr-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
            />
          </div>
          <button
            onClick={fetchPosts}
            className="py-2 px-3 rounded-lg font-semibold bg-[#1B3D2F] text-white hover:bg-[#153125]"
          >
            Tìm
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chapter filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả các chương</option>
              {CHAPTERS_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  Chương {c.id}: {c.title.split(':')[1]?.trim() || c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                sortBy === 'latest' ? 'bg-white text-[#1B3D2F] shadow-xs' : 'text-slate-600'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                sortBy === 'popular' ? 'bg-white text-[#1B3D2F] shadow-xs' : 'text-slate-600'
              }`}
            >
              Quan tâm nhiều
            </button>
          </div>

          {/* My Posts Toggle */}
          <button
            onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
              showMyPostsOnly
                ? 'bg-[#1B3D2F] text-white border-[#1B3D2F]'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Bài của tôi
          </button>
        </div>
      </div>

      {/* Main Content Layout: Posts List (6 cols) & Selected Post Details (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-6 space-y-3">
          {isLoadingPosts ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              <div className="w-5 h-5 border-2 border-[#1B3D2F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải danh sách bài thảo luận...
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Chưa có bài viết nào phù hợp.</p>
              <p>Hãy bấm "Đăng câu hỏi mới" để bắt đầu chủ đề đầu tiên!</p>
            </div>
          ) : (
            displayedPosts.map((post) => {
              const isSelected = selectedPost?.id === post.id;
              const hasLiked = !!post.userReactions?.[currentUser.id];

              return (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#1B3D2F] ring-2 ring-[#1B3D2F]/20 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{post.authorName}</span>
                          {post.authorRole === 'lecturer' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#D6A64F] text-[#1B3D2F]">
                              Giảng viên
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {post.chapterTitle && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium truncate max-w-[160px]">
                        {post.chapterTitle.split(':')[0]}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#1B3D2F] line-clamp-1 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReact(post.id, 'like');
                        }}
                        className={`flex items-center gap-1 transition-colors ${
                          hasLiked ? 'text-[#1B3D2F] font-bold' : 'hover:text-slate-800'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.reactions?.like || 0}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>

                    {post.isVerifiedAnswer && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" /> Có giải đáp từ GV
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Post Thread & Discussion (Right 6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col min-h-[500px]">
          {selectedPost ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedPost.authorAvatar}
                    alt={selectedPost.authorName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{selectedPost.authorName}</h4>
                      {selectedPost.authorRole === 'lecturer' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#D6A64F] text-[#1B3D2F]">
                          Giảng viên
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Đăng lúc {new Date(selectedPost.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportingPostId(selectedPost.id)}
                  title="Báo cáo bài viết không phù hợp"
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div>
                <h3 className="font-bold text-base text-[#1B3D2F] mb-2">{selectedPost.title}</h3>
                <div className="text-xs text-slate-700 leading-relaxed bg-[#FAF9F5] p-3.5 rounded-xl border border-slate-200">
                  <MathView content={selectedPost.content} />
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5B6F2B]" />
                  Bình luận ({comments.length})
                </h5>

                {isLoadingComments ? (
                  <p className="text-xs text-slate-400 text-center py-4">Đang tải bình luận...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
                  </p>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        comm.authorRole === 'lecturer'
                          ? 'bg-emerald-50/70 border border-emerald-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{comm.authorName}</span>
                          {comm.authorRole === 'lecturer' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#5B6F2B] text-white">
                              Giảng viên
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-slate-700 leading-relaxed">
                        <MathView content={comm.content} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCreateComment} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder={`Bình luận với tên ${currentUser.name}...`}
                  className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1B3D2F]"
                />
                <button
                  type="submit"
                  disabled={!commentContent.trim() || isSubmittingComment}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1B3D2F] text-white hover:bg-[#153125] transition-all disabled:opacity-40"
                >
                  Gửi
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">Chọn một chủ đề để xem thảo luận</p>
              <p className="text-xs">Bạn có thể bình luận hoặc trao đổi trực tiếp trên dữ liệu đồng bộ của lớp học.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Post */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1B3D2F]">Đăng câu hỏi hoặc thảo luận XSTK</h3>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chương kiến thức</label>
                <select
                  value={newChapterId}
                  onChange={(e) => setNewChapterId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {CHAPTERS_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      Chương {c.id}: {c.title.split(':')[1]?.trim() || c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề bài viết</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Cách tính tích phân mật độ phân phối chuẩn..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  placeholder="Mô tả cụ thể thắc mắc của bạn, có thể chèn công thức LaTeX $P(A|B)$..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="py-2 px-4 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost}
                  className="py-2 px-5 rounded-lg font-bold bg-[#1B3D2F] text-white hover:bg-[#153125]"
                >
                  {isSubmittingPost ? 'Đang lưu vào máy chủ...' : 'Đăng bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Post */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-sm text-slate-800">Báo cáo bài viết không phù hợp</h4>
            <p className="text-slate-500">
              Chọn lý do báo cáo bài viết. Ban quản trị sẽ xác minh và xử lý:
            </p>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Nội dung không liên quan XSTK">Nội dung không liên quan XSTK</option>
              <option value="Spam hoặc quảng cáo">Spam hoặc quảng cáo</option>
              <option value="Ngôn từ không lịch sự">Ngôn từ không lịch sự</option>
              <option value="Chia sẻ đề thi cấm">Chia sẻ đề thi cấm</option>
            </select>

            {reportSuccessMsg && (
              <p className="text-emerald-700 font-semibold">{reportSuccessMsg}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="py-1.5 px-3 rounded-lg font-semibold text-slate-600"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleReport}
                className="py-1.5 px-4 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
