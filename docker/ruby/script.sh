#!/bin/bash
 
# Sample execution command: ./script.sh php main.php
 
compiler=$1
file=$2
output=$3
input=$4
 
START=$(date +%s.%4N)
 
$compiler $file -< $input > $output
 
END=$(date +%s.%4N)
 
runtime=$(echo "$END - $START" | bc)
 
echo $runtime