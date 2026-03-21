export default function AdminPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-3 px-4 py-16 text-center sm:min-h-[60vh]">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Admin Panel</h1>
      <p className="text-sm text-zinc-400 sm:text-base">
        Тільки для адміністраторів.
      </p>
    </div>
  );
}
