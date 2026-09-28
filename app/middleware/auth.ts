export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn.value) {
    return navigateTo({
      path: "/sign-in",
      query: { redirect_url: to.fullPath },
    });
  }
});
