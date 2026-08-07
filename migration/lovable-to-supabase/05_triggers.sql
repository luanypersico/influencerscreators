-- Triggers próprios; triggers internos do Supabase Storage são gerenciados pela plataforma.
BEGIN;

DROP TRIGGER IF EXISTS "on_auth_user_created" ON auth."users";
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS "email_campaigns_updated_at" ON public."email_campaigns";
CREATE TRIGGER email_campaigns_updated_at BEFORE UPDATE ON public."email_campaigns" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "email_templates_updated_at" ON public."email_templates";
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public."email_templates" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "orders_updated_at" ON public."orders";
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public."orders" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "payment_integrations_bergamo_only" ON public."payment_integrations";
CREATE TRIGGER payment_integrations_bergamo_only BEFORE INSERT OR UPDATE OF product_id, provider ON public."payment_integrations" FOR EACH ROW EXECUTE FUNCTION public.enforce_bergamo_only_integration();

DROP TRIGGER IF EXISTS "payment_integrations_updated_at" ON public."payment_integrations";
CREATE TRIGGER payment_integrations_updated_at BEFORE UPDATE ON public."payment_integrations" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "product_access_updated_at" ON public."product_access";
CREATE TRIGGER product_access_updated_at BEFORE UPDATE ON public."product_access" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "product_collaborators_updated_at" ON public."product_collaborators";
CREATE TRIGGER product_collaborators_updated_at BEFORE UPDATE ON public."product_collaborators" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "product_items_updated_at" ON public."product_items";
CREATE TRIGGER product_items_updated_at BEFORE UPDATE ON public."product_items" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "product_items_updated_at_v2" ON public."product_items";
CREATE TRIGGER product_items_updated_at_v2 BEFORE UPDATE ON public."product_items" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "product_updates_updated_at" ON public."product_updates";
CREATE TRIGGER product_updates_updated_at BEFORE UPDATE ON public."product_updates" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "products_updated_at" ON public."products";
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public."products" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "profiles_updated_at" ON public."profiles";
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public."profiles" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS "webhook_events_updated_at" ON public."webhook_events";
CREATE TRIGGER webhook_events_updated_at BEFORE UPDATE ON public."webhook_events" FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
