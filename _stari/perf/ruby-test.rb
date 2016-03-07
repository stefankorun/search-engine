$start = Time.now.to_f * 1000
$i = 0
$num = 100000

$a = []
while $i < $num  do
    $i += 1
    $a.push("50")
end

print (Time.now.to_f * 1000) - $start