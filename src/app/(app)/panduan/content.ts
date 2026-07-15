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
      "Camera Angle Guide Pro (FramePilot) membantu kamu menerjemahkan ide atau referensi visual menjadi data sudut kamera yang terstruktur (schema camera-angle-guide/v2) sekaligus prompt AI yang tinggal salin-tempel. Ada dua layar yang saling terhubung: Data Prompt (Pustaka) untuk mengimpor, mengelola entri, dan mulai dari kartu ✦ Preset (template shot siap pakai), dan Studio 3D untuk merancang rig kamera dan menangkap frame.",
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
    intro: "Empat cara memasukkan data di Pustaka. Pilih sesuai bahan yang kamu punya — atau lewati impor dan mulai dari kartu ✦ Preset lewat “Gunakan Template”.",
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
    id: "sudut",
    kicker: "06 · Tata bahasa",
    title: "Sudut kamera: pilih dari relasi kuasa & informasi",
    intro:
      "Elevasi kamera relatif terhadap titik fokus mengubah makna sebuah shot. Pilih sudut dari informasi yang perlu dipahami penonton dan emosi yang perlu dirasakan — bukan karena \"terlihat keren\". Terapkan tiap contoh lewat preset sudut di Studio 3D untuk melihat bedanya langsung, bukan hanya membacanya.",
    steps: [
      {
        title: "Eye Level · netral 0°",
        detail:
          "Kamera sejajar mata. Terasa jujur, dekat, dan tidak memaksakan penilaian pada subjek. Pakai untuk: dialog, interview, tutorial.",
      },
      {
        title: "High Angle · dominan +35°",
        detail:
          "Kamera melihat ke bawah. Subjek terasa lebih kecil, rentan, tertekan, atau sedang diamati. Pakai untuk: vulnerability, reveal ruang.",
      },
      {
        title: "Low Angle · power −25°",
        detail:
          "Kamera melihat ke atas. Menambah skala, kekuatan, ancaman, atau rasa heroik. Pakai untuk: hero shot, authority, product.",
      },
      {
        title: "Bird's Eye · top-down +80°",
        detail:
          "Pandangan hampir tegak dari atas. Membaca pola, blocking, dan hubungan antarobjek dengan jelas. Pakai untuk: layout, food, choreography.",
      },
      {
        title: "Worm's Eye · extreme low −55°",
        detail:
          "Sudut sangat rendah yang mendramatisasi tinggi dan membuat lingkungan terasa monumental. Pakai untuk: spectacle, architecture, tension.",
      },
      {
        title: "Dutch Angle · roll 18°",
        detail:
          "Horizon dimiringkan. Memberi rasa tidak stabil, aneh, panik, atau dunia yang mulai \"salah\". Hindari pemakaian dekoratif tanpa alasan.",
      },
    ],
    tip: "Buka Studio 3D dan pakai preset sudut untuk mencoba tiap contoh pada rig — perbedaannya jauh lebih mudah dipahami saat dilihat langsung.",
  },
  {
    id: "shot-size",
    kicker: "07 · Tata bahasa",
    title: "Ukuran shot: atur seberapa banyak informasi yang masuk",
    intro:
      "Shot size dihitung dari tinggi subjek, jarak kamera, dan FOV lensa. Makin dekat, makin intim dan spesifik; makin lebar, makin banyak konteks ruang yang ikut bercerita.",
    steps: [
      {
        title: "Extreme Close-Up (ECU)",
        detail:
          "Detail sangat kecil — mata, tangan, tekstur produk. Intens dan sangat spesifik. Fungsi: detail penting, sensory cue.",
      },
      {
        title: "Close-Up (CU)",
        detail:
          "Wajah atau detail utama mengisi frame. Prioritasnya emosi, reaksi, atau kualitas produk. Fungsi: emosi dan emphasis.",
      },
      {
        title: "Medium Close-Up (MCU)",
        detail:
          "Kompromi antara ekspresi dan bahasa tubuh. Sangat efektif untuk talking-head. Fungsi: dialog, edukasi, testimonial.",
      },
      {
        title: "Medium Shot (MS)",
        detail:
          "Menampilkan gestur dan interaksi tanpa kehilangan wajah. Ini \"default\" yang fleksibel. Fungsi: presentasi, aksi ringan.",
      },
      {
        title: "Full Shot (FS)",
        detail:
          "Seluruh tubuh terlihat. Blocking, pose, kostum, dan relasi dengan lantai jadi penting. Fungsi: fashion, movement, choreography.",
      },
      {
        title: "Wide Shot (WS)",
        detail:
          "Lingkungan ikut bercerita. Subjek jadi bagian dari ruang, bukan satu-satunya informasi. Fungsi: establishing, scale, geography.",
      },
    ],
    tip: "Prinsip inti: mulai dari informasi apa yang perlu dipahami penonton dan emosi apa yang perlu dirasakan, lalu pilih shot size + sudut yang paling jujur menyampaikan keduanya. Pakai preset shot di Studio 3D untuk mengatur jaraknya.",
  },
  {
    id: "tema",
    kicker: "08 · Resep fitur",
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
    kicker: "09 · Resep fitur",
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
