#!/usr/bin/env ruby
# encoding: UTF-8
require 'json'

$if_pretty = true

hash = {}
File.open("data.txt").each do |line|
  col = line.encode("UTF-8").chomp.split("\t")
  hash[col[0]] = {}
  hash[col[0]]['basket_img'] = "images/items/00#{(rand*6+1).to_i}.png"
  hash[col[0]]['product_img'] = "images/items/00#{(rand*6+1).to_i}.png"
  hash[col[0]]['desc'] = col[4]

  hash[col[0]]['tags'] = {}
  col[1].split(/\s*，\s*|\s*,\s*/).each { |tag|  hash[col[0]]['tags'][tag] = true }
end

fout = File.open("../data.v1.1.0.json", 'w:utf-8')
fout.puts $if_pretty ? JSON.pretty_generate(hash) : hash.to_json


p hash.collect { |key, value| key+value['tags'].keys.join }.join