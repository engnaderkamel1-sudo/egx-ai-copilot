# build_changelog_and_update.py
import re

print("--- Step 1: Updating index.html ---")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read().replace('\r\n', '\n')

# 1. Add sidebar tab-changelog after tab-glossary
sidebar_marker = '''          <button onclick="switchTab('glossary')" id="tab-glossary" class="tab-btn w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60">
            <div class="flex items-center gap-2.5">
              <i data-lucide="book-open" class="w-4 h-4 text-cyan-400 shrink-0"></i>
              <span>دليل المصطلحات المالية</span>
            </div>
          </button>'''

sidebar_replacement = '''          <button onclick="switchTab('glossary')" id="tab-glossary" class="tab-btn w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60">
            <div class="flex items-center gap-2.5">
              <i data-lucide="book-open" class="w-4 h-4 text-cyan-400 shrink-0"></i>
              <span>دليل المصطلحات المالية</span>
            </div>
          </button>
          <button onclick="switchTab('changelog')" id="tab-changelog" class="tab-btn w-full px-3 py-2.5 rounded-xl flex items-center justify-between transition text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60">
            <div class="flex items-center gap-2.5">
              <i data-lucide="git-branch" class="w-4 h-4 text-emerald-400 shrink-0"></i>
              <span>سجل التحديثات</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">v2.4.8</span>
          </button>'''

assert sidebar_marker in html, "sidebar_marker not found in index.html"
html = html.replace(sidebar_marker, sidebar_replacement, 1)

# 2. Add #app-update-available-banner right above #oed-emergency-banner
banner_marker = '      <!-- OED TTMS Pattern: Global Real-Time Emergency Sticky Banner (Light Red Theme) -->'
banner_replacement = '''      <!-- Real-Time System Auto-Update Available Banner -->
      <div id="app-update-available-banner" class="hidden sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-2xl px-4 py-3 transition-all border-b-2 border-emerald-400 animate-pulse">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-white/20 text-white font-bold shrink-0 shadow-sm">
              <i data-lucide="sparkles" class="w-5 h-5 text-yellow-300"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-xs sm:text-sm text-white">🚀 يتوفر تحديث جديد للنظام!</span>
                <span id="update-banner-version-badge" class="bg-white text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">إصدار جديد</span>
              </div>
              <p id="update-banner-desc" class="text-xs text-emerald-100 font-bold mt-0.5">تم رفع تحسينات وميزات جديدة؛ اضغط على زر التحديث لتطبيقها فوراً بلمسة واحدة.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="applyAppUpdateNow()" class="bg-white hover:bg-slate-100 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
              <i data-lucide="refresh-cw" class="w-4 h-4 text-emerald-800"></i>
              <span>تحديث الصفحة الآن 🔄</span>
            </button>
            <button type="button" onclick="dismissUpdateBanner()" class="text-white/80 hover:text-white p-1 rounded-lg" title="تأجيل">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- OED TTMS Pattern: Global Real-Time Emergency Sticky Banner (Light Red Theme) -->'''

assert banner_marker in html, "banner_marker not found in index.html"
html = html.replace(banner_marker, banner_replacement, 1)

# 3. Add view-changelog right before </main>
main_close_marker = '  </main>'
changelog_view_html = '''    <!-- ============================================== -->
    <!-- TAB 11: SYSTEM CHANGELOG & RELEASES AUDIT     -->
    <!-- ============================================== -->
    <div id="view-changelog" class="view-panel hidden space-y-6">
      
      <!-- Changelog Header Card -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div class="border-b border-gray-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <i data-lucide="git-branch" class="w-4 h-4"></i>
              <span>سجل التحديثات والإصدارات الرسمية (System Changelog)</span>
            </div>
            <h2 class="text-xl font-bold text-white">سجل كافة التعديلات والتطويرات المرفوعة للنظام</h2>
            <p class="text-xs text-gray-400 mt-1">تتبع دقيق وموثق لكل ميزة تم إضافتها أو تعديلها مع التاريخ والتوقيت الرسمي بالدقيقة لتأكيد وصول التحديثات لجهازك</p>
          </div>
          
          <div class="flex items-center gap-3 shrink-0 flex-wrap">
            <span class="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>الإصدار النشط على جهازك: <span id="current-installed-version-badge" class="font-mono">v2.4.8</span></span>
            </span>
            <button type="button" onclick="checkForAppUpdates(false)" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>فحص التحديثات الآن</span>
            </button>
          </div>
        </div>

        <!-- Release Timeline Container -->
        <div id="changelog-timeline-container" class="space-y-4 pt-2">
          <!-- Dynamically populated via renderChangelogUI() -->
        </div>
      </div>

    </div>

  </main>'''

assert main_close_marker in html, "main_close_marker not found in index.html"
html = html.replace(main_close_marker, changelog_view_html, 1)

# 4. Bump version to 2.4.8 across all script tags
html = html.replace('?v=2.4.7', '?v=2.4.8')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] index.html updated successfully")
