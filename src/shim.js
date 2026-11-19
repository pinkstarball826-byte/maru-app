// Claude上の公開ページ専用の仕組み(claude.use)の代わりに置く土台。
// 今は何も返さないので、アプリは端末内の保存だけで動く。
// ここを実際のバックエンド(Firebase / Supabase など)に差し替えると、友達とのランキング・広場が動く。
// 差し替え時に満たす形: claude.use("user") -> { id() }, claude.use("db") -> collection(name).doc(id).set/get, collection(name).orderBy().limit().onSnapshot()
window.claude=window.claude||{use:async function(){return null;}};
