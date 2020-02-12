

for script in scripts/run/*.sh
do
    echo "Executing script $script"
    sh "$script"
done
