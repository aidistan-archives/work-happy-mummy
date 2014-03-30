#!/usr/bin/env ruby
# encoding: UTF-8
require 'json'

$if_pretty = true

hash = {}
File.open("data.txt").each do |line|
  col = line.encode("UTF-8").chomp.split("\t")
  hash[col[1]] = {}
  hash[col[1]]['category'] = col[0]
  hash[col[1]]['img'] = "images/items/00#{(rand*6+1).to_i}.png"
  hash[col[1]]['tags'] = {}
  if col[2]
    col[2].split(/，\s*|,\s*/).each { |tag|  hash[col[1]]['tags'][tag] = true }
  end
  
end

fout = File.open("../data.js", 'w:utf-8')
fout.puts ["var model = {}",""]
fout.print "model.data = "
fout.puts $if_pretty ? JSON.pretty_generate(hash) : hash.to_json
