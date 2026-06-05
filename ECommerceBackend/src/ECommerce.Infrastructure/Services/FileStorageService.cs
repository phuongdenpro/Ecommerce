using ECommerce.Application.Common.Settings;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace ECommerce.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;
    private readonly string _rootPath;

    public FileStorageService(IOptions<FileStorageSettings> settings, IWebHostEnvironment env)
    {
        _settings = settings.Value;
        _rootPath = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), _settings.UploadPath);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveFileAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
    {
        ValidateFile(file);
        var dir = Path.Combine(_rootPath, folder);
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(dir, fileName);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream, cancellationToken);
        return $"{_settings.BaseUrl.TrimEnd('/')}/{folder}/{fileName}";
    }

    public async Task<IReadOnlyList<string>> SaveFilesAsync(IEnumerable<IFormFile> files, string folder, CancellationToken cancellationToken = default)
    {
        var urls = new List<string>();
        foreach (var file in files)
            urls.Add(await SaveFileAsync(file, folder, cancellationToken));
        return urls;
    }

    public void DeleteFile(string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl)) return;
        var relative = fileUrl.Replace(_settings.BaseUrl, "").TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var full = Path.Combine(_rootPath, relative);
        if (File.Exists(full)) File.Delete(full);
    }

    private void ValidateFile(IFormFile file)
    {
        if (file.Length == 0) throw new InvalidOperationException("Empty file.");
        if (file.Length > _settings.MaxFileSizeBytes) throw new InvalidOperationException("File too large.");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("File type not allowed.");
    }
}
