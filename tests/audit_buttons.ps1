$onclicks = @(
  'adjustFineTunePrice', 'adjustFineTuneShares', 'applyFineTuning', 'askCopilot',
  'calculateSmartAllocation', 'cancelPendingRebuy', 'cancelRotationPlan', 'confirmCompletedRebuy', 'clearChat', 'clearLearnedLessons',
  'clearNotificationHistory', 'closeAssetModal', 'closeAuditModal', 'closeAutonomousLogModal',
  'closeAutonomousTrade', 'closeFineTuneModal', 'closeGeminiModal', 'closeNotificationCenter',
  'closePositionSizingModal', 'closePriceLevelsModal', 'closeRotationModal', 'closeSanityAuditModal',
  'closeSimPosition', 'closeThndrSyncModal', 'closeTradeModal', 'commitRotationPlan',
  'completeRotationPlan', 'completeRotationPlanToCIB', 'copyAuditReport', 'copyThndrVerifiedScript', 'handleThndrViewSyncSubmit', 'pasteThndrFromClipboardView', 'dismissOedBanner',
  'executeRiskCalculations', 'executeSimulatedBuy', 'fetchLiveEGXPricesAndReevaluate',
  'fetchSingleStockLivePrice', 'forceFreshSync', 'generateStructuredThesis', 'handleAuditOrRotate',
  'handleManualThndrImportSubmit', 'handleOedBannerAction',
  'hardResetPortfolioToDefault', 'openAddAssetModal', 'openAuditModal', 'openFineTuneModal',
  'openGeminiModal', 'openNotificationCenter', 'openPositionSizingModal', 'openPriceLevelsModal',
  'openRotationPlanModalByTicker', 'openRotationPlanModal', 'openSanityAuditModal',
  'openThndrSyncModal', 'openTradeModal', 'pasteThndrFromClipboard', 'printAuditReport', 'quickApplySafetyLevel', 'removeGeminiApiKey',
  'requestBrowserNotificationPermission', 'resetCustomPriceLevelsModal', 'resetPaperTrading',
  'resetToDefaultPortfolio', 'runLiveSanityAudit', 'runSimulationEngine', 'saveCustomPriceLevelsModal',
  'saveGeminiApiKeyFromInput', 'saveGeminiKeyFromModal', 'saveInlineGeminiKey', 'saveStrategySettings',
  'setRadarFilter', 'setRebalanceAmount', 'setRotationRatio', 'setTradeMode', 'showAutonomousLogModal',
  'simulateMarketEmergency', 'switchActionHubCategory', 'switchPlanToCIB', 'switchTab', 'testGeminiConnection',
  'testGeminiConnectionFromModal', 'toggleSidebar', 'toggleSidebarDrawer', 'toggleTheme',
    'openVoiceTradingModal', 'closeVoiceTradingModal', 'toggleVoiceRecording', 'toggleChatVoiceInput',
  'parseVoiceFromManualInput', 'testVoiceCommandSample', 'executeVoiceOrderFromModal', 'resetVoiceModalToListen',
  'toggleTradeCustomTicker', 'triggerCloudScanNow', 'triggerSimulatedBotCycle'
)

$missing = @()
foreach ($fn in $onclicks) {
  $found = $false
  foreach ($f in (Get-ChildItem -Path js -Filter *.js)) {
    $content = Get-Content -Path $f.FullName -Raw
    if ($content -match "function\s+$fn\b|$fn\s*=\s*function|window\.$fn\s*=") {
      $found = $true
      break
    }
  }
  if (-not $found) {
    $missing += $fn
  }
}
Write-Host "Total functions checked: $($onclicks.Count)"
Write-Host "Missing functions count: $($missing.Count)"
if ($missing.Count -gt 0) {
  $missing | ForEach-Object { Write-Host "  MISSING: $_" -ForegroundColor Red }
} else {
  Write-Host "ALL ONCLICK FUNCTIONS EXIST IN JS FILES!" -ForegroundColor Green
}
