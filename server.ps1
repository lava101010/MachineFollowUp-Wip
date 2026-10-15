$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    $port = 8081
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
}

$url = "http://localhost:$port/index.html"
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Energya Cables 3D Factory - Local Server Active!      " -ForegroundColor Green
Write-Host "   URL: $url                                              " -ForegroundColor Yellow
Write-Host "   Auto-reading production_data.csv is LIVE!             " -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server                        " -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process $url

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".csv"  = "text/csv; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$baseDir = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq '/') {
            $rawPath = "index.html"
        }

        # URL decode path
        $decodedPath = [System.Uri]::UnescapeDataString($rawPath)
        $filePath = Join-Path $baseDir $decodedPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $response.ContentType = $mime
            
            # Add CORS headers
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            # Disable cache for CSV files so live updates are immediate
            if ($ext -eq ".csv") {
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
                $response.Headers.Add("Pragma", "no-cache")
                $response.Headers.Add("Expires", "0")
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $decodedPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Keep server running on transient client disconnects
    }
}
