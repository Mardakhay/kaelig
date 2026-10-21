-- A SECURITY DEFINER trigger function should not resolve names through a writable schema.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
