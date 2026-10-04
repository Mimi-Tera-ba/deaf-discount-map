[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$csvPath = "raw_data.csv"
$jsPath = "data.js"

# CSVの読み込み（UTF-8）
try {
    $data = Import-Csv $csvPath -Encoding UTF8
} catch {
    Write-Host "CSVの読み込みに失敗しました。エンコーディングを確認しています..."
    $data = Import-Csv $csvPath -Encoding Default
}

$facilities = @()
$cache = @{}

Write-Host "データの変換（住所→緯度経度）を開始します。データ量が多いと数分かかります..."

$i = 0
foreach ($row in $data) {
    $i++
    $genre = $row.'ジャンル'
    $name = $row.'施設・サービス名'
    $pref = $row.'都道府県'
    $address = $row.'住所または運行エリア'
    $discount = $row.'割引内容'
    $url = $row.'公式サイトURL'
    
    # URLが空の場合は対応
    if ($null -eq $url) { $url = "" }
    
    $searchAddr = if ([string]::IsNullOrWhiteSpace($address)) { $pref } else { $address }
    
    $lat = $null
    $lng = $null
    
    if ($cache.ContainsKey($searchAddr)) {
        $lat = $cache[$searchAddr].lat
        $lng = $cache[$searchAddr].lng
    } else {
        $encAddr = [uri]::EscapeDataString($searchAddr)
        $urlApi = "https://nominatim.openstreetmap.org/search?q=$encAddr&format=json&limit=1"
        try {
            $resp = Invoke-RestMethod -Uri $urlApi -Headers @{"User-Agent"="DeafDiscountMap/1.0"} -Method Get -TimeoutSec 5
            if ($resp.Count -gt 0) {
                $lat = $resp[0].lat
                $lng = $resp[0].lon
            }
        } catch {
            # エラー時はスキップ
        }
        $cache[$searchAddr] = @{ lat=$lat; lng=$lng }
        Start-Sleep -Milliseconds 1200 # 無料サーバーへの負荷軽減
    }
    
    # 取得できなかった場合は仮の座標
    if ($lat -eq $null) {
        $lat = 35.681236
        $lng = 139.767125
    }
    
    $facilities += @{
        genre = $genre
        name = $name
        pref = $pref
        address = $address
        discount = $discount
        url = $url
        lat = $lat
        lng = $lng
    }
    
    if ($i % 10 -eq 0) {
        Write-Host "処理中: $i / $($data.Count) 件完了"
    }
}

# JavaScriptファイルとして書き出す
$json = $facilities | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path $jsPath -Value "const facilitiesData = $json;" -Encoding UTF8

Write-Host "すべての処理が完了しました！ data.js が更新されました。"
