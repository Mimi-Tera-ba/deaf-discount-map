[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$csvPath = "raw_data.csv"
$jsPath = "data.js"

try {
    $data = Import-Csv $csvPath -Encoding UTF8
} catch {
    $data = Import-Csv $csvPath -Encoding Default
}

$facilities = @()
$cache = @{}

Write-Host "国土地理院の高精度APIを使用して、正確な緯度経度を再取得します..."

$i = 0
foreach ($row in $data) {
    $i++
    $genre = $row.'ジャンル'
    $name = $row.'施設・サービス名'
    $pref = $row.'都道府県'
    $city = $row.'市町村'
    $address = $row.'住所または運行エリア'
    $discount = $row.'割引内容'
    $url = $row.'公式サイトURL'
    
    if ($null -eq $url) { $url = "" }
    
    $lat = $null
    $lng = $null
    
    # 検索候補（1.完全な住所 2.施設名を含めた検索 3.都道府県＋市町村のみ）
    $queries = @($address, "$pref$city", $pref)
    
    foreach ($q in $queries) {
        if ([string]::IsNullOrWhiteSpace($q)) { continue }
        
        # 不要なビル名や空白を削除してヒット率を上げる
        $cleanQ = $q -replace "ビル.*", "" -replace "階.*", "" -replace " ", "" -replace "　", ""
        
        if ($cache.ContainsKey($cleanQ)) {
            $lat = $cache[$cleanQ].lat
            $lng = $cache[$cleanQ].lng
            break
        }
        
        $encAddr = [uri]::EscapeDataString($cleanQ)
        # 優秀な国土地理院のAPIを使用（完全無料・高精度）
        $urlApi = "https://msearch.gsi.go.jp/address/search?q=$encAddr"
        try {
            $resp = Invoke-RestMethod -Uri $urlApi -Method Get -TimeoutSec 5
            if ($resp.Count -gt 0 -and $null -ne $resp[0].geometry.coordinates) {
                # 国土地理院は [経度(lng), 緯度(lat)] の順で返ってくる
                $lng = $resp[0].geometry.coordinates[0]
                $lat = $resp[0].geometry.coordinates[1]
                $cache[$cleanQ] = @{ lat=$lat; lng=$lng }
                break
            }
        } catch {}
        Start-Sleep -Milliseconds 300
    }
    
    # どうしてもダメな場合は東京駅
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
    
    if ($i % 20 -eq 0) {
        Write-Host "処理中: $i / $($data.Count) 件完了"
    }
}

$json = $facilities | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path $jsPath -Value "const facilitiesData = $json;" -Encoding UTF8

Write-Host "完了しました！ data.js を上書きしました。"
