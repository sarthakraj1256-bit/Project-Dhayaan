
-- Products table for Dhyaan Store
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'subscription',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  stock_limited boolean NOT NULL DEFAULT false,
  stock_count integer DEFAULT 0,
  total_sales integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'completed',
  payment_method text DEFAULT 'card',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Revenue logs (daily aggregates)
CREATE TABLE public.revenue_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  gross_revenue numeric NOT NULL DEFAULT 0,
  infrastructure_cost numeric NOT NULL DEFAULT 0,
  marketing_cost numeric NOT NULL DEFAULT 0,
  net_revenue numeric NOT NULL DEFAULT 0,
  transaction_count integer NOT NULL DEFAULT 0,
  new_subscribers integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(log_date)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policies using has_role function
CREATE POLICY "admin_read_products" ON public.products
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_products" ON public.products
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_products" ON public.products
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_products" ON public.products
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_read_transactions" ON public.transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_transactions" ON public.transactions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_transactions" ON public.transactions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_transactions" ON public.transactions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_read_revenue_logs" ON public.revenue_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_revenue_logs" ON public.revenue_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_revenue_logs" ON public.revenue_logs
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_revenue_logs" ON public.revenue_logs
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on products
CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Admin RPC to get revenue summary
CREATE OR REPLACE FUNCTION public.admin_get_revenue_summary()
RETURNS TABLE(
  today_revenue numeric,
  month_revenue numeric,
  total_revenue numeric,
  today_transactions bigint,
  month_transactions bigint,
  today_change numeric,
  month_change numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN t.created_at::date = CURRENT_DATE THEN t.amount ELSE 0 END), 0) as today_revenue,
    COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE) THEN t.amount ELSE 0 END), 0) as month_revenue,
    COALESCE(SUM(t.amount), 0) as total_revenue,
    COUNT(CASE WHEN t.created_at::date = CURRENT_DATE THEN 1 END) as today_transactions,
    COUNT(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END) as month_transactions,
    -- Change vs yesterday
    CASE 
      WHEN COALESCE(SUM(CASE WHEN t.created_at::date = CURRENT_DATE - 1 THEN t.amount END), 0) = 0 THEN 0
      ELSE ROUND(
        ((COALESCE(SUM(CASE WHEN t.created_at::date = CURRENT_DATE THEN t.amount END), 0) - 
          COALESCE(SUM(CASE WHEN t.created_at::date = CURRENT_DATE - 1 THEN t.amount END), 0)) /
          COALESCE(SUM(CASE WHEN t.created_at::date = CURRENT_DATE - 1 THEN t.amount END), 1)) * 100, 1)
    END as today_change,
    -- Change vs last month
    CASE
      WHEN COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month') AND t.created_at < date_trunc('month', CURRENT_DATE) THEN t.amount END), 0) = 0 THEN 0
      ELSE ROUND(
        ((COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE) THEN t.amount END), 0) -
          COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month') AND t.created_at < date_trunc('month', CURRENT_DATE) THEN t.amount END), 0)) /
          COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE - interval '1 month') AND t.created_at < date_trunc('month', CURRENT_DATE) THEN t.amount END), 1)) * 100, 1)
    END as month_change
  FROM public.transactions t
  WHERE t.status = 'completed';
END;
$$;

-- Admin RPC to get revenue by category for donut chart
CREATE OR REPLACE FUNCTION public.admin_get_revenue_by_category()
RETURNS TABLE(category text, total numeric, percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  grand_total numeric;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO grand_total FROM public.transactions WHERE status = 'completed';

  RETURN QUERY
  SELECT
    COALESCE(p.category, 'other') as category,
    COALESCE(SUM(t.amount), 0) as total,
    CASE WHEN grand_total = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(t.amount), 0) / grand_total) * 100, 1)
    END as percentage
  FROM public.transactions t
  LEFT JOIN public.products p ON t.product_id = p.id
  WHERE t.status = 'completed'
  GROUP BY p.category
  ORDER BY total DESC;
END;
$$;

-- Admin RPC for daily revenue chart data (last 30 days)
CREATE OR REPLACE FUNCTION public.admin_get_daily_revenue(days_back integer DEFAULT 30)
RETURNS TABLE(day date, revenue numeric, transaction_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    d::date as day,
    COALESCE(SUM(t.amount), 0) as revenue,
    COUNT(t.id) as transaction_count
  FROM generate_series(
    CURRENT_DATE - (days_back || ' days')::interval,
    CURRENT_DATE,
    '1 day'
  ) d
  LEFT JOIN public.transactions t ON t.created_at::date = d::date AND t.status = 'completed'
  GROUP BY d::date
  ORDER BY d::date;
END;
$$;
