// Penanda "sudah di peramban".
//
// Halaman aplikasi di-prerender saat build. Apa pun yang bergantung pada jam
// peramban (tanggal hari ini, soal kuis hari ini) atau pada localStorage akan
// berbeda antara hasil build dan saat halaman dibuka — kalau ikut dirender di
// server, hasilnya hydration mismatch.
//
// useSyncExternalStore adalah cara resmi menanyakan hal ini: `false` di server
// dan pada render hydrate, `true` sesudahnya — tanpa setState di dalam efek.

import { useSyncExternalStore } from "react";

const langganiKosong = () => () => {};
const diKlien = () => true;
const diServer = () => false;

export function useSudahDiKlien() {
  return useSyncExternalStore(langganiKosong, diKlien, diServer);
}
