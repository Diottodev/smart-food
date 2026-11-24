CREATE POLICY "anon can view order by id for active tenants" ON public."order"
FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.company c WHERE c.id = "order".company_id AND c.status IN ('trial','active')));

CREATE POLICY "anon can view order items for active tenants" ON public.order_item
FOR SELECT TO anon
USING (EXISTS (
  SELECT 1 FROM public."order" o JOIN public.company c ON c.id = o.company_id
  WHERE o.id = order_item.order_id AND c.status IN ('trial','active')
));

GRANT SELECT ON public."order" TO anon;
GRANT SELECT ON public.order_item TO anon;