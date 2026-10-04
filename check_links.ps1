$csvPath = "raw_data.csv"
$reportPath = "link_report.md"

# CSVの読み込み
try {
    $data = Import-Csv $csvPath -Encoding UTF8
} catch {
    $data = Import-Csv $csvPath -Encoding Default
}

Write-Host "公式サイトのリンク切れチェックを開始します（テストのため最初の20件をチェックします）..."

$report = "# 🔗 リンク切れ確認レポート`n"
$report += "確認日時: $(Get-Date -Format 'yyyy/MM/dd HH:mm:ss')`n`n"
$report += "以下の施設の公式サイトにアクセスできない可能性があります。`n`n"
$report += "| 施設名 | URL | ステータス |`n"
$report += "|---|---|---|`n"

$errorCount = 0
$i = 0

foreach ($row in $data) {
    $url = $row.'公式サイトURL'
    $name = $row.'施設・サービス名'
    
    if ([string]::IsNullOrWhiteSpace($url)) { continue }
    if ($url -notmatch "^http") { continue }
    
    # テストのため20件で終了（本番は全てチェックします）
    if ($i -ge 20) { break }
    $i++
    
    try {
        # サイトに負荷をかけないよう HEAD リクエストで高速チェック
        $resp = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "[正常] $name" -ForegroundColor Green
    } catch {
        $errorCount++
        $errorMsg = $_.Exception.Response.StatusCode.value__
        if ($null -eq $errorMsg) { $errorMsg = "タイムアウト/接続エラー" }
        
        $report += "| $name | $url | ❌ エラー ($errorMsg) |`n"
        Write-Host "[エラー] $name : $url" -ForegroundColor Red
    }
}

if ($errorCount -eq 0) {
    $report += "| (すべて正常) | - | ✅ 問題なし |`n"
}

# レポートをマークダウン形式で保存
Set-Content -Path $reportPath -Value $report -Encoding UTF8
Write-Host "`nチェックが完了しました。 $reportPath に結果を保存しました。"
