/**
 * content.ts — sumber data murni untuk halaman Panduan (cookbook).
 * Konten dipisah dari page.tsx supaya render tetap ringkas (data-driven .map).
 * Bukan komponen — tidak kena batas LOC. Edit teks panduan di sini.
 */

export type GuideStep = { title: string; detail: string };

export type GuideSection = {
  id: string;
  /** label mono kecil di atas judul */
  kicker: string;
  title: string;
  /** paragraf pembuka (opsional) */
  intro?: string;
  /** langkah bernomor (opsional) */
  steps?: GuideStep[];
  /** poin/tips bullet (opsional) */
  bullets?: string[];
  /** kotak tips di bawah section (opsional) */
  tip?: string;
};

export const GUIDE_INTRO = {
  eyebrow: "Panduan · Cookbook",
  title: "Camera Angle Guide Pro — dari ide shot ke prompt siap pakai",
  desc: "Ubah ide atau referensi (foto · YouTube · teks · JSON) jadi data sudut kamera terstruktur + prompt AI, lalu tata dan rancang shot di Studio 3D. Ikuti resep di bawah dari awal sampai ekspor.",
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "apa-itu",
    kicker: "01 · Kenalan",
    title: "Apa ini & untuk siapa",
    intro:
      "Camera Angle Guide Pro (FramePilot) membantu kamu menerjemahkan ide atau referensi visual menjadi data sudut kamera yang terstruktur (schema camera-angle-guide/v2) sekaligus prompt AI yang tinggal salin-tempel. Ada dua layar yang saling terhubung: Data Prompt (Pustaka) untuk mengimpor & mengelola entri, dan Studio 3D untuk merancang rig kamera dan menangkap frame.",
    bullets: [
      "Sutradara & videografer yang mau merencanakan sudut kamera sebelum syuting.",
      "Kreator AI video/gambar yang butuh prompt kamera yang konsisten dan rapi.",
      "Storyboard artist yang ingin mengekspor rangkaian shot jadi CSV atau storyboard.",
      "Siapa pun yang punya referensi (foto/link/teks) dan mau memecahnya jadi data sudut yang bisa dipakai ulang.",
    ],
    tip: "Belum punya data? Buka Pustaka, tempel satu deskripsi shot atau tautan YouTube — app akan mengurainya jadi entri sudut kamera pertamamu.",
  },
  {
    id: "alur",
    kicker: "02 · Alur kerja",
    title: "Alur end-to-end: dari impor ke ekspor",
    intro:
      "Resep utama dari nol sampai hasil akhir. Kerjakan berurutan; setiap langkah menyiapkan bahan untuk langkah berikutnya.",
    steps: [
      {
        title: "Impor data di Pustaka",
        detail:
          "Buka Data Prompt (Pustaka) di halaman /. Masukkan sumber: unggah foto referensi, tempel tautan YouTube, tempel teks bebas, atau tempel JSON schema camera-angle-guide/v2. App mengurai sumber jadi entri sudut kamera.",
      },
      {
        title: "Tinjau & rapikan entri",
        detail:
          "Periksa hasil parse: sudut, jenis shot, lensa, dan catatan. Sunting kalau perlu supaya datanya akurat sebelum dibawa ke Studio.",
      },
      {
        title: "Terapkan / Buka di Studio 3D",
        detail:
          "Dari entri, pilih Terapkan / Buka di Studio 3D. Data sudut kamera dimuat sebagai titik awal rig di halaman /editor.",
      },
      {
        title: "Atur rig & Tambah Frame",
        detail:
          "Di Studio 3D, atur posisi kamera, sudut, dan lensa lewat preset atau kontrol manual. Saat komposisi pas, klik Tambah Frame untuk menangkap shot itu. Ulangi untuk tiap shot yang kamu mau.",
      },
      {
        title: "Ekspor atau Salin Prompt",
        detail:
          "Setelah frame terkumpul, ekspor JSON (data lengkap), CSV (untuk spreadsheet/shot list), atau Storyboard (rangkaian gambar). Atau langsung Salin Prompt untuk ditempel ke tool AI video/gambar.",
      },
    ],
    tip: "Alur ini dua arah: kamu bisa balik lagi ke Pustaka untuk menambah referensi, lalu kembali ke Studio untuk menambah frame — datanya tetap nyambung.",
  },
  {
    id: "impor",
    kicker: "03 · Resep Pustaka",
    title: "Cara impor tiap jenis sumber",
    intro: "Empat cara memasukkan data di Pustaka. Pilih sesuai bahan yang kamu punya.",
    steps: [
      {
        title: "Foto referensi",
        detail:
          "Unggah gambar (still film, foto lokasi, atau frame favorit). App membaca komposisinya dan menebak sudut kamera, jenis shot, dan perkiraan lensa jadi entri baru.",
      },
      {
        title: "Tautan YouTube",
        detail:
          "Tempel URL video. Cocok saat kamu mereferensi gaya kamera sebuah adegan — hasilnya jadi entri yang bisa kamu sunting.",
      },
      {
        title: "Tempel teks",
        detail:
          "Tulis atau tempel deskripsi shot dalam bahasa bebas (mis. \"low angle, close-up wajah, lensa 85mm, cahaya samping\"). App menstrukturkannya jadi field sudut/shot/lensa.",
      },
      {
        title: "Tempel JSON",
        detail:
          "Punya data dengan schema camera-angle-guide/v2? Tempel langsung JSON-nya untuk impor presisi tanpa parsing ulang. Ini cara paling akurat memindahkan data antar proyek.",
      },
    ],
    tip: "Campur beberapa sumber dalam satu proyek: foto untuk mood, teks untuk detail lensa, JSON untuk shot yang sudah baku.",
  },
  {
    id: "studio",
    kicker: "04 · Resep Studio 3D",
    title: "Menata rig & menangkap frame",
    intro:
      "Studio 3D (/editor) adalah tempat kamu merancang kamera secara visual. Preset mempercepat; kontrol manual menyempurnakan.",
    steps: [
      {
        title: "Pakai preset sudut",
        detail:
          "Pilih preset sudut (mis. eye-level, low angle, high angle, bird's-eye) untuk langsung menempatkan kamera pada ketinggian & kemiringan umum. Titik awal cepat sebelum finetune.",
      },
      {
        title: "Pakai preset shot",
        detail:
          "Pilih jenis shot (extreme close-up, close-up, medium, wide, extreme wide) untuk mengatur jarak kamera ke subjek sesuai framing standar.",
      },
      {
        title: "Pakai preset lensa",
        detail:
          "Pilih focal length (mis. 24mm, 35mm, 50mm, 85mm) untuk mengubah field of view. Lensa lebar melebarkan ruang; lensa panjang memampatkan dan mengaburkan latar.",
      },
      {
        title: "Sempurnakan manual",
        detail:
          "Geser posisi, orbit, dan target kamera untuk komposisi persis yang kamu mau. Preset dan kontrol manual bisa dipadu.",
      },
      {
        title: "Tambah Frame",
        detail:
          "Kalau komposisi sudah pas, klik Tambah Frame. Shot itu tersimpan ke daftar frame proyek, lengkap dengan sudut/shot/lensanya. Ulangi untuk shot berikutnya.",
      },
    ],
    tip: "Urutan frame yang kamu tangkap = urutan storyboard/CSV saat ekspor. Tangkap sesuai alur adegan biar hasil ekspor langsung rapi.",
  },
  {
    id: "playback",
    kicker: "05 · Resep fitur",
    title: "Playback frame",
    intro:
      "Setelah punya beberapa frame, gunakan Playback untuk memutar rangkaian shot secara berurutan — seperti pratinjau storyboard bergerak.",
    steps: [
      {
        title: "Kumpulkan minimal 2 frame",
        detail: "Playback jalan begitu ada lebih dari satu frame di daftar.",
      },
      {
        title: "Jalankan Playback",
        detail:
          "Tekan play; kamera berpindah dari frame ke frame sesuai urutan. Pakai untuk mengecek ritme dan transisi antar sudut sebelum ekspor.",
      },
    ],
    tip: "Kalau transisi terasa janggal, ubah urutan atau sunting frame di antaranya, lalu putar ulang.",
  },
  {
    id: "guide-belajar",
    kicker: "06 · Resep fitur",
    title: "Guide Belajar",
    intro:
      "Guide Belajar adalah panduan sinematografi bawaan di dalam Studio — penjelasan singkat tiap sudut, jenis shot, dan efek lensa sambil kamu bekerja.",
    bullets: [
      "Buka Guide Belajar saat ragu memilih preset — ada penjelasan kapan tiap sudut/shot dipakai.",
      "Pakai sebagai referensi cepat tanpa keluar dari Studio 3D.",
      "Cocok untuk belajar bahasa sinematografi sambil langsung mempraktikkannya di rig.",
    ],
  },
  {
    id: "tema",
    kicker: "07 · Resep fitur",
    title: "Tema tampilan",
    intro:
      "Sesuaikan tampilan lewat pemilih mode dan preset. Semua warna mengikuti token, jadi konsisten di terang maupun gelap.",
    steps: [
      {
        title: "Pilih mode",
        detail:
          "Terang, Gelap, atau Sistem (ikut setelan perangkat/OS). Pilih Sistem kalau mau otomatis ikut siang/malam perangkatmu.",
      },
      {
        title: "Pilih preset",
        detail:
          "Ganti palet lewat preset (tweakcn) untuk mengubah nuansa warna aksen tanpa menyentuh keterbacaan.",
      },
    ],
    tip: "Setelan tema hanya soal tampilan — tidak mengubah data proyek atau hasil ekspormu.",
  },
  {
    id: "simpan",
    kicker: "08 · Resep fitur",
    title: "Simpan proyek",
    intro:
      "Cara penyimpanan tergantung status login. Keduanya menyimpan pekerjaanmu, tapi jangkauannya beda.",
    steps: [
      {
        title: "Login = tersimpan di cloud",
        detail:
          "Kalau kamu login, proyek tersimpan di cloud dan bisa dibuka lagi dari perangkat mana pun dengan akun yang sama.",
      },
      {
        title: "Anonim = tersimpan lokal",
        detail:
          "Tanpa login, proyek tersimpan di perangkat/browser ini saja. Praktis untuk coba cepat, tapi tidak ikut kalau ganti perangkat atau bersihkan data browser.",
      },
    ],
    tip: "Sudah lama kerja secara anonim dan mau amankan? Login, lalu ekspor JSON sebagai cadangan sebelum berpindah perangkat.",
  },
];
