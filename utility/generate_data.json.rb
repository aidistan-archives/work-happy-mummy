#!/usr/bin/env ruby
require 'json'

hash = {}
File.open('data.txt').each do |line|
  col = line.encode('UTF-8').chomp.split("\t")
  hash[col[0]] = {}
  hash[col[0]]['basket_img'] = 'images/basket/' + col[1]
  hash[col[0]]['basket_color'] = col[2]
  hash[col[0]]['product_img'] = 'images/product/' + col[3]
  col[3] =~ /\d\d\d/
  hash[col[0]]['desc'] = File.open("desc/#{$&}.html").read.gsub(/\s/, '')
  hash[col[0]]['tags'] = {}
  col[4].split(/\s*，\s*|\s*,\s*/).each do |tag|
    hash[col[0]]['tags'][tag] = true
  end
end

fout = File.open('../data.json', 'w:utf-8')
fout.puts JSON.pretty_generate(hash)

# For youziku to generate the font CSS
p hash.collect { |key, value| key + value['tags'].keys.join }.join
