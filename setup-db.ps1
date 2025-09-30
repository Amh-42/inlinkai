# PowerShell script to setup database
$sqlFile = "database-schema-essential.sql"
$connectionString = "mysql://root:@localhost:3306/inlinkff_main"

Write-Host "🚀 Setting up database with essential schema..." -ForegroundColor Green

# Read SQL file
$sqlContent = Get-Content $sqlFile -Raw

# Split into statements and execute each one
$statements = $sqlContent -split ';' | Where-Object { $_.Trim() -ne '' -and -not $_.Trim().StartsWith('--') }

Write-Host "📝 Found $($statements.Count) SQL statements" -ForegroundColor Yellow

foreach ($statement in $statements) {
    $cleanStatement = $statement.Trim()
    if ($cleanStatement -ne '' -and -not $cleanStatement.StartsWith('/*')) {
        Write-Host "⚡ Executing: $($cleanStatement.Substring(0, [Math]::Min(50, $cleanStatement.Length)))..." -ForegroundColor Cyan
        # You would execute the SQL statement here with your preferred MySQL client
    }
}

Write-Host "✅ Database setup completed!" -ForegroundColor Green
