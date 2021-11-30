## 1. Install [Deno](https://deno.land/)
Deno is node.js creator Ryan Dahl's new child.

Shell (Mac, Linux):
```
curl -fsSL https://deno.land/x/install/install.sh | sh
```
PowerShell (Windows)
```
iwr https://deno.land/x/install/install.ps1 -useb | iex
```
Homebrew (Mac)
```
brew install deno
```
Chocolatey (Windows)
```
choco install deno
```
Scoop (Windows)
```
scoop install deno
```
## 2. Run
Format: 
```
deno run seats.ts [desired seats] [rows] [columns] [space-separated list of available seats]

deno run seats.ts [desired seats] < data.json
```

Example:
```
deno run seats.ts 2 10 10 a5 a6 d5 d6 e5 f5 f4
```
```
deno run seats.ts 1 < data.json
```

## 3. Run tests
```
deno test
```