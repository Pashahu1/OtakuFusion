export default function VerifySuccessPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Email подтверждён</h1> <p>Теперь вы можете войти в аккаунт.</p>
      <a href="/auth/login">Перейти к входу</a>
    </div>
  );
}
