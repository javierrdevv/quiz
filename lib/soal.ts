import 'server-only';

export type Tema =
  | 'biru'
  | 'hijau'
  | 'ungu'
  | 'oranye'
  | 'merah'
  | 'toska'
  | 'pink'
  | 'kuning'
  | 'navy'
  | 'teal';

export type Soal = {
  teks: string;
  opsi: string[];
  kunci: 0 | 1 | 2 | 3;
  pembahasan: string;
  tema: Tema;
  durasiMs: number;
};

export const DURASI_DEFAULT_MS = 20_000;

export const SOAL: Soal[] = [
  {
    teks: 'Menurutmu, apa arti utama kebijakan publik?',
    opsi: [
      'Tindakan pemerintah untuk menyelesaikan masalah dan kepentingan masyarakat',
      'Aturan yang dibuat sekolah untuk kedisiplinan siswa',
      'Program tabungan bagi warga sipil',
      'Kegiatan kelompok dalam organisasi sekolah',
    ],
    kunci: 0,
    pembahasan:
      'Kebijakan publik adalah keputusan dan tindakan pemerintah untuk menyelesaikan persoalan yang menyangkut kepentingan masyarakat luas.',
    tema: 'biru',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Manakah yang termasuk contoh kebijakan publik di bidang pendidikan?',
    opsi: [
      'Pemberian izin usaha oleh pemerintah daerah',
      'Pelarangan minuman keras di jalan',
      'Kebijakan zonasi penerimaan peserta didik baru',
      'Pemungutan pajak kendaraan bermotor',
    ],
    kunci: 2,
    pembahasan:
      'Kebijakan zonasi adalah aturan pemerintah yang mengatur penerimaan siswa di sekolah, sehingga masuk dalam kebijakan pendidikan.',
    tema: 'hijau',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Pajak yang dipungut dari penghasilan seseorang disebut',
    opsi: [
      'Pajak bumi dan bangunan',
      'Pajak penghasilan',
      'Pajak pertambahan nilai',
      'Bea balik nama kendaraan',
    ],
    kunci: 1,
    pembahasan:
      'Pajak penghasilan (PPh) adalah pajak yang dikenakan atas penghasilan berupa gaji, upah, honor, dan penghasilan lain seseorang.',
    tema: 'ungu',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Badan di bawah Presiden yang menyusun dan mengendalikan kebijakan pembangunan nasional adalah',
    opsi: [
      'BAPPENAS',
      'BPJS',
      'BULOG',
      'BPUPKI',
    ],
    kunci: 0,
    pembahasan:
      'BAPPENAS (Badan Perencanaan Pembangunan Nasional) menyusun rencana pembangunan dan mengendalikan kebijakannya agar sesuai sasaran.',
    tema: 'oranye',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Mekanisme penyaluran kepentingan dalam pembentukan kebijakan publik yang paling demokratis adalah melalui',
    opsi: [
      'Keputusan sepihak pengusaha',
      'Instruksi dari aparat keamanan',
      'Musyawarah dan keterlibatan warga',
      'Perintah langsung atasan',
    ],
    kunci: 2,
    pembahasan:
      'Dalam negara demokrasi, kebijakan publik lahir dari musyawarah dan pelibatan warga agar kepentingan semua pihak terwakili.',
    tema: 'merah',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Kebijakan publik yang mengatur penyaluran bantuan langsung kepada masyarakat terdampak diberi nama',
    opsi: [
      'Program Kesejahteraan Sosial',
      'Kartu Prakerja',
      'Program Keluarga Harapan',
      'Bantuan Langsung Tunai',
    ],
    kunci: 3,
    pembahasan:
      'Bantuan Langsung Tunai (BLT) adalah kebijakan pemerintah berupa penyaluran uang untuk membantu masyarakat terdampak keadaan tertentu.',
    tema: 'toska',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Peraturan daerah (Perda) adalah salah satu bentuk kebijakan publik yang dibuat oleh',
    opsi: [
      'Pemerintah pusat dan presiden',
      'Dewan Perwakilan Rakyat Daerah bersama kepala daerah',
      'Lembaga yudikatif di tingkat nasional',
      'Pejabat kementerian dalam negeri',
    ],
    kunci: 1,
    pembahasan:
      'Perda dibuat oleh DPRD bersama kepala daerah (gubernur/bupati/wali kota) sebagai wujud kebijakan publik di tingkat daerah.',
    tema: 'pink',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Urutan penerapan kebijakan publik yang benar adalah',
    opsi: [
      'Evaluasi, implementasi, formulasi',
      'Implementasi, formulasi, evaluasi',
      'Formulasi, implementasi, evaluasi',
      'Formulasi, evaluasi, implementasi',
    ],
    kunci: 2,
    pembahasan:
      'Kebijakan publik diawali dengan formulasi (perumusan), lalu implementasi (pelaksanaan), kemudian evaluasi (penilaian) terhadap hasilnya.',
    tema: 'kuning',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Ciri utama akibat kebijakan publik yang tidak melibatkan masyarakat adalah',
    opsi: [
      'Mudah diterima semua warga',
      'Cepat berjalan tanpa hambatan',
      'Menimbulkan protes dan penolakan',
      'Otomatis menaikkan penerimaan negara',
    ],
    kunci: 2,
    pembahasan:
      'Tanpa keterlibatan masyarakat, kebijakan bisa terasa memaksa sehingga protes dan penolakan adalah akibat yang paling mungkin muncul.',
    tema: 'navy',
    durasiMs: DURASI_DEFAULT_MS,
  },
  {
    teks: 'Ruang-ruang diskusi politik, seperti musrenbang dan konsultasi publik, gunanya untuk',
    opsi: [
      'Menunda rencana pembangunan',
      'Mengganti tugas pemerintah pusat',
      'Menampung aspirasi warga dalam kebijakan',
      'Menghapus kewajiban warga membayar pajak',
    ],
    kunci: 2,
    pembahasan:
      'Musrenbang dan konsultasi publik adalah forum resmi untuk menyerap aspirasi warga agar kebijakan sesuai kebutuhan masyarakat.',
    tema: 'teal',
    durasiMs: DURASI_DEFAULT_MS,
  },
];