#!/usr/bin/env ruby
# encoding: UTF-8
require 'rake'

FileList['*.jpg', '*.png'].each do |file|
  # file =~ /\d\d\d\.(jpg|png)/
  `mv '#{file}' basket_#{file}`
end
