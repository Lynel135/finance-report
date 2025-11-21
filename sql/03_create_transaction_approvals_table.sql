-- Create transaction approvals table for admin approval tracking
CREATE TABLE IF NOT EXISTS transaction_approvals (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  approved_by TEXT REFERENCES users(nis),
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_approvals_transaction_id ON transaction_approvals(transaction_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approved_by ON transaction_approvals(approved_by);
