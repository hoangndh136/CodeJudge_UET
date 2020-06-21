#!/bin/bash
 
# Sample execution command: ./script.sh php main.php
 
compiler=$1
folder=$2
file=$3
output=$4
input=$5

START=$(date +%s.%4N)

$compiler -o a.out $file
/a -<$input > $output
 
END=$(date +%s.%4N)
 
runtime=$(echo "$END - $START")
 
echo $runtime