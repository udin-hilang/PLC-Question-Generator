# Aturan Bentuk Flowchart

Berikut adalah aturan baku bentuk flowchart yang harus digunakan saat AI (Gemini) menghasilkan kode Mermaid (`graph TD`). Setiap bentuk memiliki fungsi spesifik.

## Daftar Bentuk & Fungsi

| Bentuk | Syntax Mermaid | Fungsi | Keterangan |
|--------|---------------|--------|------------|
| **Oval / Rounded Rectangle** (Ujung) | `A([Start atau End])` | **Start / End** (Terminator) | Menandai awal dan akhir dari alur sistem. Selalu ada di awal dan akhir flowchart. |
| **Rectangle** (Kotak) | `B[Proses]` | **Process** (Proses) | Menandai sebuah langkah proses, aksi, atau operasi (misal: "Aktifkan Motor Konveyor", "Hitung Biaya"). |
| **Diamond** (Jajar-genjang / Belah ketupat) | `C{Keputusan?}` | **Decision** (Keputusan) | Menandai titik pengambilan keputusan dengan kondisi Ya/Tidak atau Benar/Salah. Harus memiliki minimal 2 outgoing branch (`-- Yes -->`, `-- No -->`). |
| **Parallelogram** (Jajar-genjang miring) | `D[/Input atau Output/]` | **Input / Output** | Menandai operasi input (membaca sensor, tombol) atau output (menampilkan di layar, menulis ke memory). Di Mermaid bisa ditulis dengan garis miring di kedua sisi label. |
| **Rectangle dengan garis ganda** | `E[[Subroutine]]` | **Subroutine** (Prosedur Bawaan) | Menandai prosedur atau sub-program yang sudah ada sebelumnya (misal: "Jalankan Routine Pembersihan"). |
| **Cylinder** | `F[(Database)]` | **Storage / Database** | Menandai penyimpanan data (misal: "Simpan Data Ke Historian"). |
| **Circle** | `G((Connector))` | **Connector** | Titik penghubung saat flowchart terlalu panjang dan perlu dipisah ke halaman/lainnya. |

## Aturan Ketat untuk Mermaid Syntax

1. **Selalu dimulai dengan** `graph TD`
2. **Node definitions diletakkan TERLEBIH DAHULU**, baru setelahnya garis transisi. JANGAN gunakan format `A --> B[Label]`. Gunakan: `B[Label]` di baris terpisah, lalu `A --> B`.
3. **Node ID** harus unik dan diawali huruf kapital (contoh: `A`, `B`, `C1`, `D2`).
4. **Label dalam node** tidak boleh menggunakan karakter spesial seperti `{`, `}`, `[`, `]`, `(`, `)` di dalam label kecuali sebagai syntax Mermaid yang valid.
5. **Setiap Decision (Diamond)** wajib memiliki minimal 2 outgoing arrows bertLabel `-- Yes -->` dan `-- No -->`.
6. **Setiap Process (Rectangle)** hanya berisi teks deskripsi aksi, bukan kondisi logika.
7. **Tidak boleh ada blank line** di dalam kode Mermaid.
8. **Tidak boleh menggunakan markdown code block** (` ```mermaid `) di dalam string flowchart_code.

## Contoh Mapping untuk Soal PLC

Untuk soal sistem garasi berbayar berikut:

- `([Start: Inisialisasi])` → **Oval** (Start)
- `{E-Stop Aktif?}` → **Diamond** (Keputusan)
- `[Latching System & Lampu ON]` → **Rectangle** (Proses)
- `[/Tombol ON ditekan/]` → **Parallelogram** (Input)
- `[/Layar menampilkan total harga/]` → **Parallelogram** (Output)
- `[[Reset Counter & Timer]]` → **Subroutine** (Jika ada prosedur bawaan)

## Ringkasan Visual

```
  ([Start])          ← Oval: Awal
      |
      v
  [/Input/]          ← Parallelogram: Input
      |
      v
  {Keputusan?}       ← Diamond: Keputusan
     / \
    /   \
   v     v
  [Proses]  [Proses] ← Rectangle: Proses
      |
      v
  [(Database)]       ← Cylinder: Storage
      |
      v
  ([End])            ← Oval: Akhir
```
