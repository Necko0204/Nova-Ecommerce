import { zodResolver } from '@hookform/resolvers/zod';
import type { Product } from '@nova/shared-types';
import { reviewSchema } from '@nova/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { commerceProvider } from '@/repositories/commerce';

type ReviewValues = z.infer<typeof reviewSchema>;

export function ReviewPanel({ product }: { product: Product }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: () => commerceProvider.listReviews(product.id),
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, title: '', body: '' },
  });
  const submit = useMutation({
    mutationFn: (values: ReviewValues) => commerceProvider.submitReview({ productId: product.id, ...values }),
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      toast.success('Review received and awaiting approval.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const visibleRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : product.rating || 'New';
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage: reviews.length ? Math.round(reviews.filter((review) => review.rating === rating).length / reviews.length * 100) : 0,
  }));

  return (
    <section id="reviews" className="review-panel page-shell">
      <header className="review-panel__heading">
        <div><p className="section-index">Customer notes</p><h2>{visibleRating} out of 5</h2><p>{isLoading ? 'Reading customer notes…' : `Based on ${reviews.length || product.reviewCount} approved reviews`}</p></div>
        <div className="review-distribution">{distribution.map((row) => <div key={row.rating}><span>{row.rating} star</span><i><b style={{ width: `${row.percentage}%` }} /></i><small>{row.count}</small></div>)}</div>
        <div className="review-stars" aria-label={`${visibleRating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill="currentColor" />)}</div>
      </header>
      <div className="review-panel__content">
        <div className="review-list">
          {reviews.slice(0, 6).map((review) => <article key={review.id}><div className="review-list__meta"><span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><time>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div><h3>{review.title}</h3><p>{review.body}</p><footer>{review.customerName}{review.verifiedPurchase && <span><CheckCircle2 size={12} /> Verified purchase</span>}</footer></article>)}
          {!isLoading && reviews.length === 0 && <div className="review-empty"><h3>Be the first to leave a note.</h3><p>Share how this object found a place in your routine.</p></div>}
        </div>
        <aside className="review-form-card">
          <p className="eyebrow">Your experience</p><h3>Write a review</h3>
          {!user ? <p className="review-signin">Purchased this piece? <Link to="/login">Sign in</Link> to share your experience.</p> : <form onSubmit={handleSubmit((values) => submit.mutate(values))}>
            <label>Rating<select {...register('rating', { valueAsNumber: true })}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} — {value === 5 ? 'Exceptional' : value === 4 ? 'Very good' : value === 3 ? 'Good' : value === 2 ? 'Fair' : 'Needs work'}</option>)}</select></label>
            <label>Review title<input {...register('title')} placeholder="What stood out?" />{errors.title && <span>{errors.title.message}</span>}</label>
            <label>Your review<textarea {...register('body')} rows={5} placeholder="Tell us about the design, quality, and daily use." />{errors.body && <span>{errors.body.message}</span>}</label>
            <button disabled={submit.isPending}>{submit.isPending ? 'Sending…' : 'Submit for review'}</button>
          </form>}
          <small>Reviews are moderated before publishing. Verified purchase status is assigned securely from order history.</small>
        </aside>
      </div>
    </section>
  );
}
