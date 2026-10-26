/* AI & Sentiment Analysis (simple keyword-based NLP) */
const Analyzer = {
  positive: ['love','great','excellent','good','happy','easy','fast','amazing','helpful','thanks','perfect'],
  negative: ['bad','slow','worst','terrible','hate','angry','broken','poor','disappointed','rude','late','refund','crash','error','not working'],
  categories: {
    'Bug': ['bug','crash','error','broken','not working','fails'],
    'Feature Request': ['feature','wish','missing','please add','would like','support for'],
    'Complaint': ['slow','rude','late','refund','worst','terrible','disappointed','angry'],
    'Praise': ['love','great','excellent','amazing','thanks','perfect','helpful']
  },
  urgentWords: ['urgent','immediately','asap','cancel','legal','refund','data loss','crash'],

  count(text, words) { return words.filter(w => text.includes(w)).length; },

  analyze(comment) {
    const t = (comment || '').toLowerCase();
    const score = this.count(t, this.positive) - this.count(t, this.negative);
    const sentiment = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral';
    let category = 'General', best = 0;
    for (const [name, words] of Object.entries(this.categories)) {
      const n = this.count(t, words);
      if (n > best) { best = n; category = name; }
    }
    return { sentiment, category, urgent: this.count(t, this.urgentWords) > 0 };
  }
};
