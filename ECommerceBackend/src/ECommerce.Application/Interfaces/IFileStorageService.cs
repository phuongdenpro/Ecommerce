using Microsoft.AspNetCore.Http;

namespace ECommerce.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string folder, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> SaveFilesAsync(IEnumerable<IFormFile> files, string folder, CancellationToken cancellationToken = default);
    void DeleteFile(string fileUrl);
}
