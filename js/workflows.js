/* Score scales + automated workflow rules (alerts and routing) */
const Scales = {
  NPS:  { min: 0, max: 10, label: 'How likely are you to recommend us? (0-10)' },
  CSAT: { min: 1, max: 5,  label: 'How satisfied are you? (1-5)' },
  CES:  { min: 1, max: 7,  label: 'How easy was it for you? (1-7, higher is easier)' }
};

const Workflow = {
  teamFor: { 'Bug': 'Engineering', 'Feature Request': 'Product', 'Complaint': 'Support', 'Praise': 'Marketing', 'General': 'Support' },

  isLowScore(type, score) {
    return (type === 'NPS' && score <= 6) || (type === 'CSAT' && score <= 2) || (type === 'CES' && score <= 3);
  },

  // Turns a submitted answer into a full feedback record
  process(raw) {
    const a = Analyzer.analyze(raw.comment);
    return {
      ...raw,
      id: 'F' + Date.now() + Math.floor(Math.random() * 100000),
      date: raw.date || new Date().toISOString(),
      sentiment: a.sentiment, category: a.category, urgent: a.urgent,
      team: this.teamFor[a.category],                                   // auto-routing
      alert: this.isLowScore(raw.type, raw.score) || a.sentiment === 'Negative' || a.urgent, // alert rule
      status: 'New', replies: []
    };
  }
};
