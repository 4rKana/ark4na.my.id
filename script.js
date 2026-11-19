// 1. Efek Typewriter untuk Subtitle Header
const textToType = "> SYSTEM INITIALIZED... INFORMATICS & NETWORK INFRASTRUCTURE SPECIALIST.";
const typeWriterElement = document.getElementById("typewriter");
let i = 0;

function typeWriter() {
    if (!typeWriterElement) return;

    if (i < textToType.length) {
        typeWriterElement.innerHTML += textToType.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    } else {
        setInterval(() => {
            if (typeWriterElement.innerHTML.endsWith("_")) {
                typeWriterElement.innerHTML = typeWriterElement.innerHTML.slice(0, -1);
            } else {
                typeWriterElement.innerHTML += "_";
            }
        }, 500);
    }
}

document.addEventListener("DOMContentLoaded", typeWriter);

// 2. Real-time System Clock
function updateTime() {
    const timeElement = document.getElementById('sys-time');
    if (!timeElement) return;

    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds} WIB`;
}

setInterval(updateTime, 1000);
updateTime();

// ==========================================
// 3. LOGIKA TRANSISI TAB (PENGGANTI SCROLL)
// ==========================================
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault(); // Mencegah reload atau jump ke href

        // Ambil ID tujuan dari href (contoh: "#akademik")
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // Hapus class 'active' dari semua menu navigasi
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            // Tambahkan class 'active' ke menu yang diklik
            this.classList.add('active');

            // Hapus class 'active' dari semua section (menyembunyikan mereka)
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });

            // Beri jeda sangat kecil (10ms) sebelum memunculkan section baru 
            // agar CSS animation memicu ulang (re-trigger) dari awal
            setTimeout(() => {
                targetSection.classList.add('active');
            }, 10);
        }
    });
});