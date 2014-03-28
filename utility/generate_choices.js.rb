#!/usr/bin/env ruby
# encoding: UTF-8
require 'json'

$if_pretty = true

hash = {}
File.open("choices.txt").each do |line|
  col = line.encode("UTF-8").chomp.split("\t")
  hash[col[1]] = {}
  hash[col[1]]['category'] = col[0]
  hash[col[1]]['img'] = "images/items/00#{(rand*6+1).to_i}.png"
  hash[col[1]]['tags'] = {}
  if col[2]
    col[2].split(/，\s*|,\s*/).each { |tag|  hash[col[1]]['tags'][tag] = true }
  end
  
end

fout = File.open("../choices.js", 'w:utf-8')
fout.print "var choices = "
fout.puts $if_pretty ? JSON.pretty_generate(hash) : hash.to_json
